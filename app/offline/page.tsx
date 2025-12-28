"use client"

export default function OfflinePage() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="mb-6">
                    <span className="text-6xl">📡</span>
                </div>
                <h1 className="text-2xl font-bold mb-2">You're Offline</h1>
                <p className="text-muted-foreground mb-6">
                    It looks like you've lost your internet connection. Please check your connection and try again.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                    Try Again
                </button>
            </div>
        </div>
    )
}
