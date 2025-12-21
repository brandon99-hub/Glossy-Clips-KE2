import { auth } from "@/lib/auth-helper"
import { redirect } from "next/navigation"
import { DashboardClient } from "./dashboard-client"
import { getCustomerOrders, getCustomerProfile, getCustomerAddresses } from "./actions"

import { Suspense } from "react"

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const [ordersResult, profileResult, addressesResult] = await Promise.all([
        getCustomerOrders(),
        getCustomerProfile(),
        getCustomerAddresses(),
    ])

    if (!ordersResult.success || !profileResult.success || !addressesResult.success) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-600">Failed to load dashboard data</p>
            </div>
        )
    }

    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <DashboardClient
                orders={ordersResult.orders || []}
                customer={profileResult.customer}
                addresses={addressesResult.addresses || []}
            />
        </Suspense>
    )
}
