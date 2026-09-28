import { redirect } from "next/navigation"
import { verifyAdminSession } from "@/lib/admin-auth"
import { getAdminSettings, getDiscountSetting } from "./actions"
import { SettingsForm } from "@/app/admin/settings/settings-form"

export default async function AdminSettingsPage() {
    const isLoggedIn = await verifyAdminSession()
    if (!isLoggedIn) redirect("/admin/login")

    const [settingsResult, discountResult] = await Promise.all([
        getAdminSettings(),
        getDiscountSetting(),
    ])

    const currentEmail = settingsResult.success ? (settingsResult.data?.email as string || "") : ""
    const discountPercent = discountResult.success ? (discountResult.discountPercent ?? 10) : 10

    return <SettingsForm currentEmail={currentEmail} currentDiscount={discountPercent} />
}
