import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { AnalyticsClient } from "./analytics-client"
import {
    getRevenueData,
    getTopProducts,
    getOrderStatusBreakdown,
    getSecretCodeMetrics,
    getBundlePerformance,
    type DateRange,
} from "./actions"

export default async function AnalyticsPage({
    searchParams,
}: {
    searchParams: Promise<{ range?: string }>
}) {
    const cookieStore = await cookies()
    const isAdmin = cookieStore.get("admin_session")

    if (!isAdmin) {
        redirect("/admin/login")
    }

    const params = await searchParams
    const dateRange = (params.range as DateRange) || "30d"

    // Fetch all analytics data in parallel
    const [revenueResult, topProductsResult, orderStatusResult, secretCodesResult, bundlesResult] = await Promise.all([
        getRevenueData(dateRange),
        getTopProducts(10, dateRange),
        getOrderStatusBreakdown(dateRange),
        getSecretCodeMetrics(),
        getBundlePerformance(dateRange),
    ])

    if (
        !revenueResult.success ||
        !topProductsResult.success ||
        !orderStatusResult.success ||
        !secretCodesResult.success ||
        !bundlesResult.success
    ) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600">Failed to load analytics</h1>
                    <p className="text-muted-foreground mt-2">Please try again later</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <AnalyticsClient
                initialRevenue={revenueResult.data || []}
                initialTopProducts={topProductsResult.data || []}
                initialOrderStatus={orderStatusResult.data || []}
                initialSecretCodes={
                    secretCodesResult.data || {
                        total_codes: 0,
                        scanned_codes: 0,
                        used_codes: 0,
                        scan_rate: 0,
                        conversion_rate: 0,
                        total_revenue: 0,
                    }
                }
                initialBundles={
                    bundlesResult.data || {
                        bundle_orders: 0,
                        individual_orders: 0,
                        bundle_revenue: 0,
                        individual_revenue: 0,
                        bundle_percentage: 0,
                    }
                }
                dateRange={dateRange}
            />
        </div>
    )
}
