"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"

export type DateRange = "7d" | "30d" | "90d" | "custom"

export interface RevenueData {
  date: string
  revenue: number
  orders: number
}

export interface TopProduct {
  id: number
  name: string
  category: string
  units_sold: number
  revenue: number
  image: string
}

export interface OrderStatusData {
  status: string
  count: number
  percentage: number
}

export interface SecretCodeMetrics {
  total_codes: number
  scanned_codes: number
  used_codes: number
  scan_rate: number
  conversion_rate: number
  total_revenue: number
}

export interface BundlePerformance {
  bundle_orders: number
  individual_orders: number
  bundle_revenue: number
  individual_revenue: number
  bundle_percentage: number
}

export async function getRevenueData(
  dateRange: DateRange = "30d",
  customStart?: string,
  customEnd?: string
): Promise<{ success: boolean; data?: RevenueData[]; error?: string }> {
  try {
    let startDate: Date
    const endDate = new Date()

    if (dateRange === "custom" && customStart && customEnd) {
      startDate = new Date(customStart)
      endDate.setTime(new Date(customEnd).getTime())
    } else {
      const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90
      startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
    }

    const result = await sql`
      SELECT 
        DATE(created_at) as date,
        SUM(total_amount) as revenue,
        COUNT(*) as orders
      FROM orders 
      WHERE status IN ('paid', 'packed', 'collected')
        AND created_at >= ${startDate.toISOString()}
        AND created_at <= ${endDate.toISOString()}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `

    const data = result.map((row: any) => ({
      date: row.date,
      revenue: parseFloat(row.revenue || 0),
      orders: parseInt(row.orders || 0),
    }))

    return { success: true, data }
  } catch (error) {
    console.error("Error fetching revenue data:", error)
    return { success: false, error: "Failed to fetch revenue data" }
  }
}

export async function getTopProducts(
  limit: number = 10,
  dateRange: DateRange = "30d"
): Promise<{ success: boolean; data?: TopProduct[]; error?: string }> {
  try {
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get top products from order items
    const result = await sql`
      WITH order_items AS (
        SELECT 
          jsonb_array_elements(items) as item,
          total_amount,
          created_at
        FROM orders
        WHERE status IN ('paid', 'packed', 'collected')
          AND created_at >= ${startDate.toISOString()}
      )
      SELECT 
        p.id,
        p.name,
        p.category,
        p.images[1] as image,
        COUNT(oi.item) as units_sold,
        SUM((oi.item->>'price')::numeric * (oi.item->>'quantity')::integer) as revenue
      FROM order_items oi
      JOIN products p ON p.id = (oi.item->>'product_id')::integer
      GROUP BY p.id, p.name, p.category, p.images
      ORDER BY units_sold DESC
      LIMIT ${limit}
    `

    const data = result.map((row: any) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      image: row.image || "/placeholder.svg",
      units_sold: parseInt(row.units_sold || 0),
      revenue: parseFloat(row.revenue || 0),
    }))

    return { success: true, data }
  } catch (error) {
    console.error("Error fetching top products:", error)
    return { success: false, error: "Failed to fetch top products" }
  }
}

export async function getOrderStatusBreakdown(
  dateRange: DateRange = "30d"
): Promise<{ success: boolean; data?: OrderStatusData[]; error?: string }> {
  try {
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const result = await sql`
      SELECT 
        status,
        COUNT(*) as count
      FROM orders
      WHERE created_at >= ${startDate.toISOString()}
      GROUP BY status
      ORDER BY count DESC
    `

    const total = result.reduce((sum: number, row: any) => sum + parseInt(row.count), 0)

    const data = result.map((row: any) => ({
      status: row.status,
      count: parseInt(row.count || 0),
      percentage: total > 0 ? (parseInt(row.count || 0) / total) * 100 : 0,
    }))

    return { success: true, data }
  } catch (error) {
    console.error("Error fetching order status breakdown:", error)
    return { success: false, error: "Failed to fetch order status breakdown" }
  }
}

export async function getSecretCodeMetrics(): Promise<{
  success: boolean
  data?: SecretCodeMetrics
  error?: string
}> {
  try {
    const codesResult = await sql`
      SELECT 
        COUNT(*) as total_codes,
        COUNT(*) FILTER (WHERE is_scanned = true) as scanned_codes,
        COUNT(*) FILTER (WHERE is_used = true) as used_codes
      FROM secret_codes
    `

    const codes = codesResult[0]
    const total = parseInt(codes.total_codes || 0)
    const scanned = parseInt(codes.scanned_codes || 0)
    const used = parseInt(codes.used_codes || 0)

    const data: SecretCodeMetrics = {
      total_codes: total,
      scanned_codes: scanned,
      used_codes: used,
      scan_rate: total > 0 ? (scanned / total) * 100 : 0,
      conversion_rate: scanned > 0 ? (used / scanned) * 100 : 0,
      total_revenue: 0, // Column doesn't exist yet - run migration to track this
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error fetching secret code metrics:", error)
    return { success: false, error: "Failed to fetch secret code metrics" }
  }
}

export async function getBundlePerformance(
  dateRange: DateRange = "30d"
): Promise<{ success: boolean; data?: BundlePerformance; error?: string }> {
  try {
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Check if items contain bundles by looking at the items JSON
    const result = await sql`
      SELECT 
        COUNT(*) FILTER (
          WHERE EXISTS (
            SELECT 1 
            FROM jsonb_array_elements(items) AS item
            WHERE (item->>'is_bundle')::boolean = true
          )
        ) as bundle_orders,
        COUNT(*) FILTER (
          WHERE NOT EXISTS (
            SELECT 1 
            FROM jsonb_array_elements(items) AS item
            WHERE (item->>'is_bundle')::boolean = true
          )
        ) as individual_orders,
        COALESCE(SUM(total_amount) FILTER (
          WHERE EXISTS (
            SELECT 1 
            FROM jsonb_array_elements(items) AS item
            WHERE (item->>'is_bundle')::boolean = true
          )
        ), 0) as bundle_revenue,
        COALESCE(SUM(total_amount) FILTER (
          WHERE NOT EXISTS (
            SELECT 1 
            FROM jsonb_array_elements(items) AS item
            WHERE (item->>'is_bundle')::boolean = true
          )
        ), 0) as individual_revenue
      FROM orders
      WHERE status IN ('paid', 'packed', 'collected')
        AND created_at >= ${startDate.toISOString()}
    `

    const row = result[0]
    const bundleOrders = parseInt(row.bundle_orders || 0)
    const individualOrders = parseInt(row.individual_orders || 0)
    const totalOrders = bundleOrders + individualOrders

    const data: BundlePerformance = {
      bundle_orders: bundleOrders,
      individual_orders: individualOrders,
      bundle_revenue: parseFloat(row.bundle_revenue || 0),
      individual_revenue: parseFloat(row.individual_revenue || 0),
      bundle_percentage: totalOrders > 0 ? (bundleOrders / totalOrders) * 100 : 0,
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error fetching bundle performance:", error)
    return { success: false, error: "Failed to fetch bundle performance" }
  }
}

export async function exportAnalyticsData(dateRange: DateRange = "30d") {
  try {
    const [revenue, topProducts, orderStatus, secretCodes, bundles] = await Promise.all([
      getRevenueData(dateRange),
      getTopProducts(20, dateRange),
      getOrderStatusBreakdown(dateRange),
      getSecretCodeMetrics(),
      getBundlePerformance(dateRange),
    ])

    return {
      success: true,
      data: {
        revenue: revenue.data,
        topProducts: topProducts.data,
        orderStatus: orderStatus.data,
        secretCodes: secretCodes.data,
        bundles: bundles.data,
        exportedAt: new Date().toISOString(),
      },
    }
  } catch (error) {
    console.error("Error exporting analytics data:", error)
    return { success: false, error: "Failed to export analytics data" }
  }
}
