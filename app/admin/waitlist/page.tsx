import { getAdminWaitlistData } from "./actions"
import { WaitlistClient } from "./waitlist-client"

export default async function AdminWaitlistPage() {
    const result = await getAdminWaitlistData()

    if (!result.success) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">Failed to load waitlist data</p>
                </div>
            </div>
        )
    }

    return <WaitlistClient initialData={result.data} />
}
