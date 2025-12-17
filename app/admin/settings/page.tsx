"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Mail, Lock, Save, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateAdminEmail, updateAdminPassword, getAdminSettings } from "./actions"

export default function AdminSettingsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [loadingPassword, setLoadingPassword] = useState(false)
    const [email, setEmail] = useState("")
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [emailSuccess, setEmailSuccess] = useState(false)
    const [passwordSuccess, setPasswordSuccess] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        async function loadSettings() {
            const result = await getAdminSettings()
            if (result.success && result.data) {
                setEmail(result.data.email || "")
            }
        }
        loadSettings()
    }, [])

    const handleEmailUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        setEmailSuccess(false)

        const result = await updateAdminEmail(email)

        if (result.success) {
            setEmailSuccess(true)
            setTimeout(() => setEmailSuccess(false), 3000)
        } else {
            setError(result.error || "Failed to update email")
        }
        setLoading(false)
    }

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoadingPassword(true)
        setError("")
        setPasswordSuccess(false)

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match")
            setLoadingPassword(false)
            return
        }

        const result = await updateAdminPassword(currentPassword, newPassword)

        if (result.success) {
            setPasswordSuccess(true)
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
            setTimeout(() => setPasswordSuccess(false), 3000)
        } else {
            setError(result.error || "Failed to update password")
        }
        setLoadingPassword(false)
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Admin Settings</h1>

            <div className="grid gap-6">
                {/* Email Settings */}
                <div className="bg-white rounded-lg border p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Mail className="w-5 h-5 text-rose-600" />
                        <h2 className="text-xl font-semibold">Email Address</h2>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                        This email will be used for password reset requests.
                    </p>
                    <form onSubmit={handleEmailUpdate} className="space-y-4">
                        <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@glossyclipske.com"
                                required
                                className="mt-2"
                                disabled={loading}
                            />
                        </div>
                        {emailSuccess && (
                            <div className="flex items-center gap-2 text-green-600 text-sm">
                                <CheckCircle className="w-4 h-4" />
                                Email updated successfully!
                            </div>
                        )}
                        <Button
                            type="submit"
                            className="bg-rose-500 hover:bg-rose-600"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Email
                                </>
                            )}
                        </Button>
                    </form>
                </div>

                {/* Password Settings */}
                <div className="bg-white rounded-lg border p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Lock className="w-5 h-5 text-rose-600" />
                        <h2 className="text-xl font-semibold">Change Password</h2>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                        Update your admin password. Minimum 8 characters required.
                    </p>
                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                        <div>
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input
                                id="currentPassword"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                                required
                                className="mt-2"
                                disabled={loadingPassword}
                            />
                        </div>
                        <div>
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                required
                                minLength={8}
                                className="mt-2"
                                disabled={loadingPassword}
                            />
                        </div>
                        <div>
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                required
                                minLength={8}
                                className="mt-2"
                                disabled={loadingPassword}
                            />
                        </div>
                        {error && (
                            <div className="text-sm text-red-600">{error}</div>
                        )}
                        {passwordSuccess && (
                            <div className="flex items-center gap-2 text-green-600 text-sm">
                                <CheckCircle className="w-4 h-4" />
                                Password updated successfully!
                            </div>
                        )}
                        <Button
                            type="submit"
                            className="bg-rose-500 hover:bg-rose-600"
                            disabled={loadingPassword}
                        >
                            {loadingPassword ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Lock className="w-4 h-4 mr-2" />
                                    Update Password
                                </>
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
