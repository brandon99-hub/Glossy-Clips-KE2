import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { exportAnalyticsData, type DateRange } from "../actions"

export async function GET(request: Request) {
    const cookieStore = await cookies()
    const isAdmin = cookieStore.get("admin_session")

    if (!isAdmin) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const range = (searchParams.get("range") as DateRange) || "30d"

    const result = await exportAnalyticsData(range)

    if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json(result)
}
