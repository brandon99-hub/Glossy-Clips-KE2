import { Package, CheckCircle, XCircle, Clock, Download } from "lucide-react"

interface QRStatisticsProps {
    total: number
    active: number
    used: number
    expired: number
    exported: number
}

export function QRStatistics({ total, active, used, expired, exported }: QRStatisticsProps) {
    const pending = total - exported

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{total}</p>
                        <p className="text-xs text-muted-foreground">Total Codes</p>
                    </div>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-green-600">{active}</p>
                        <p className="text-xs text-muted-foreground">Active</p>
                    </div>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg">
                        <XCircle className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-600">{used}</p>
                        <p className="text-xs text-muted-foreground">Used</p>
                    </div>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 rounded-lg">
                        <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-amber-600">{expired}</p>
                        <p className="text-xs text-muted-foreground">Expired</p>
                    </div>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <Download className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-blue-600">{exported}</p>
                        <p className="text-xs text-muted-foreground">Exported</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{pending} pending</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
