"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, TrendingUp, ShoppingCart, Package, QrCode, DollarSign } from "lucide-react"
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts"
import type {
    RevenueData,
    TopProduct,
    OrderStatusData,
    SecretCodeMetrics,
    BundlePerformance,
    DateRange,
} from "./actions"

interface AnalyticsClientProps {
    initialRevenue: RevenueData[]
    initialTopProducts: TopProduct[]
    initialOrderStatus: OrderStatusData[]
    initialSecretCodes: SecretCodeMetrics
    initialBundles: BundlePerformance
    dateRange: DateRange
}

const COLORS = {
    pending: "#f59e0b",
    paid: "#10b981",
    packed: "#3b82f6",
    collected: "#6b7280",
}

export function AnalyticsClient({
    initialRevenue,
    initialTopProducts,
    initialOrderStatus,
    initialSecretCodes,
    initialBundles,
    dateRange: initialDateRange,
}: AnalyticsClientProps) {
    const [dateRange, setDateRange] = useState<DateRange>(initialDateRange)
    const [isExporting, setIsExporting] = useState(false)

    const totalRevenue = initialRevenue.reduce((sum, item) => sum + item.revenue, 0)
    const totalOrders = initialRevenue.reduce((sum, item) => sum + item.orders, 0)
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    const handleExport = async () => {
        setIsExporting(true)
        try {
            const response = await fetch(`/admin/analytics/export?range=${dateRange}`)
            const data = await response.json()

            if (data.success) {
                // Convert to CSV
                const csv = convertToCSV(data.data)
                const blob = new Blob([csv], { type: "text/csv" })
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = `analytics-${dateRange}-${new Date().toISOString().split("T")[0]}.csv`
                a.click()
                window.URL.revokeObjectURL(url)
            }
        } catch (error) {
            console.error("Export failed:", error)
        } finally {
            setIsExporting(false)
        }
    }

    const convertToCSV = (data: any) => {
        // Simple CSV conversion for revenue data
        const headers = ["Date", "Revenue", "Orders"]
        const rows = data.revenue.map((r: RevenueData) => [r.date, r.revenue, r.orders])
        return [headers, ...rows].map((row) => row.join(",")).join("\n")
    }

    return (
        <div className="space-y-6">
            {/* Header with Export */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                    <p className="text-muted-foreground">Track your business performance</p>
                </div>
                <Button onClick={handleExport} disabled={isExporting}>
                    <Download className="mr-2 h-4 w-4" />
                    {isExporting ? "Exporting..." : "Export Data"}
                </Button>
            </div>

            {/* Date Range Tabs */}
            <Tabs value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)} className="w-full">
                <TabsList>
                    <TabsTrigger value="7d">Last 7 Days</TabsTrigger>
                    <TabsTrigger value="30d">Last 30 Days</TabsTrigger>
                    <TabsTrigger value="90d">Last 90 Days</TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Key Metrics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">KES {totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            {dateRange === "7d" ? "Last 7 days" : dateRange === "30d" ? "Last 30 days" : "Last 90 days"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalOrders}</div>
                        <p className="text-xs text-muted-foreground">Paid, packed & collected</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">KES {avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                        <p className="text-xs text-muted-foreground">Per order</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Secret Code Revenue</CardTitle>
                        <QrCode className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">KES {initialSecretCodes.total_revenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            {initialSecretCodes.conversion_rate.toFixed(1)}% conversion rate
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Revenue Over Time</CardTitle>
                    <CardDescription>Daily revenue and order count</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={initialRevenue}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip
                                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                                formatter={(value: any) => [value.toLocaleString(), ""]}
                            />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#f43f5e" name="Revenue (KES)" strokeWidth={2} />
                            <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#3b82f6" name="Orders" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Top Products & Order Status */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Top Products */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Products</CardTitle>
                        <CardDescription>Best selling items by units sold</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={initialTopProducts.slice(0, 5)} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={120} />
                                <Tooltip formatter={(value: any) => [value.toLocaleString(), ""]} />
                                <Bar dataKey="units_sold" fill="#f43f5e" name="Units Sold" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Order Status Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Order Status</CardTitle>
                        <CardDescription>Distribution of order statuses</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={initialOrderStatus}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ status, percentage }) => `${status}: ${percentage.toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {initialOrderStatus.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[entry.status as keyof typeof COLORS] || "#6b7280"} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Secret Code & Bundle Performance */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Secret Code Metrics */}
                <Card>
                    <CardHeader>
                        <CardTitle>Secret QR Code Performance</CardTitle>
                        <CardDescription>Scan and conversion metrics</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Total Codes Generated</span>
                            <span className="font-bold">{initialSecretCodes.total_codes}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                Codes Scanned
                                <span className="text-xs text-muted-foreground/60" title="Number of QR codes scanned by customers">(checkout codes)</span>
                            </span>
                            <span className="font-bold">{initialSecretCodes.scanned_codes}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                Codes Used (Purchased)
                                <span className="text-xs text-muted-foreground/60" title="Includes both checkout codes and reward codes from paid orders">(all types)</span>
                            </span>
                            <span className="font-bold">{initialSecretCodes.used_codes}</span>
                        </div>
                        <div className="h-px bg-border" />
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Scan Rate</span>
                            <span className="font-bold text-blue-600">{initialSecretCodes.scan_rate.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Conversion Rate</span>
                            <span className="font-bold text-green-600">{initialSecretCodes.conversion_rate.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Total Revenue</span>
                            <span className="font-bold text-rose-600">KES {initialSecretCodes.total_revenue.toLocaleString()}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Bundle Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle>Bundle vs Individual Sales</CardTitle>
                        <CardDescription>Performance comparison</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Bundle Orders</span>
                            <span className="font-bold">{initialBundles.bundle_orders}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Individual Orders</span>
                            <span className="font-bold">{initialBundles.individual_orders}</span>
                        </div>
                        <div className="h-px bg-border" />
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Bundle Revenue</span>
                            <span className="font-bold text-blue-600">KES {initialBundles.bundle_revenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Individual Revenue</span>
                            <span className="font-bold text-green-600">KES {initialBundles.individual_revenue.toLocaleString()}</span>
                        </div>
                        <div className="h-px bg-border" />
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Bundle Percentage</span>
                            <span className="font-bold text-rose-600">{initialBundles.bundle_percentage.toFixed(1)}%</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
