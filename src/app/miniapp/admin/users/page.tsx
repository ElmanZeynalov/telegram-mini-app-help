"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { UserPlus, Trash2, ChevronLeft, Shield, Key } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface AdminUser {
    id: string
    email: string
    role: string
    createdAt: string
}

export default function UsersPage() {
    // Create form state
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [createLoading, setCreateLoading] = useState(false)

    // List state
    const [admins, setAdmins] = useState<AdminUser[]>([])
    const [listLoading, setListLoading] = useState(true)

    // Password Change Dialog State
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
    const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null)
    const [selectedAdminEmail, setSelectedAdminEmail] = useState<string>("")
    const [newPassword, setNewPassword] = useState("")
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [passwordError, setPasswordError] = useState("")
    const [passwordSuccess, setPasswordSuccess] = useState("")

    const router = useRouter()

    const fetchAdmins = async () => {
        try {
            const res = await fetch("/api/admin/administrators")
            if (res.ok) {
                const data = await res.json()
                setAdmins(data.admins)
            }
        } catch (err) {
            console.error("Failed to fetch admins", err)
        } finally {
            setListLoading(false)
        }
    }

    useEffect(() => {
        fetchAdmins()
    }, [])

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreateLoading(true)
        setError("")
        setSuccess("")

        try {
            const res = await fetch("/api/admin/create-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to create user")
            }

            setSuccess(`User created successfully: ${data.user.email}`)
            setEmail("")
            setPassword("")
            fetchAdmins() // Refresh list
        } catch (err: any) {
            setError(err.message)
        } finally {
            setCreateLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this admin?")) return

        try {
            const res = await fetch(`/api/admin/administrators?id=${id}`, {
                method: "DELETE",
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Failed to delete user")
            }

            fetchAdmins() // Refresh list
        } catch (err: any) {
            alert(err.message)
        }
    }

    const openPasswordDialog = (admin: AdminUser) => {
        setSelectedAdminId(admin.id)
        setSelectedAdminEmail(admin.email)
        setNewPassword("")
        setPasswordError("")
        setPasswordSuccess("")
        setIsPasswordDialogOpen(true)
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedAdminId) return

        setPasswordLoading(true)
        setPasswordError("")
        setPasswordSuccess("")

        try {
            const res = await fetch("/api/admin/administrators", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: selectedAdminId, password: newPassword }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to update password")
            }

            setPasswordSuccess("Password updated successfully")
            setNewPassword("")
            setTimeout(() => {
                setIsPasswordDialogOpen(false)
                setPasswordSuccess("")
            }, 1000)
        } catch (err: any) {
            setPasswordError(err.message)
        } finally {
            setPasswordLoading(false)
        }
    }

    return (
        <div className="p-6 space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">User Management</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Create User Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5" />
                            Add New Admin
                        </CardTitle>
                        <CardDescription>
                            Create a new user with admin privileges.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            {error && (
                                <div className="bg-red-500/10 text-red-600 text-sm p-3 rounded-md font-medium">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="bg-green-500/10 text-green-600 text-sm p-3 rounded-md font-medium">
                                    {success}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="newuser@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Secure password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <Button type="submit" disabled={createLoading} className="w-full">
                                {createLoading ? "Creating..." : "Create User"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Admin List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Existing Admins
                        </CardTitle>
                        <CardDescription>
                            List of all users with admin access.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {listLoading ? (
                            <div className="text-center py-4 text-muted-foreground">Loading...</div>
                        ) : (
                            <div className="space-y-4">
                                {admins.map((admin) => (
                                    <div key={admin.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                                        <div>
                                            <div className="font-medium">{admin.email}</div>
                                            <div className="text-xs text-muted-foreground">
                                                Joined: {new Date(admin.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                                onClick={() => openPasswordDialog(admin)}
                                                title="Change Password"
                                            >
                                                <Key className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleDelete(admin.id)}
                                                title="Delete Admin"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {admins.length === 0 && (
                                    <div className="text-center py-4 text-muted-foreground">No admins found</div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Change Password Dialog */}
            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                            Enter a new password for <strong>{selectedAdminEmail}</strong>
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleChangePassword}>
                        <div className="space-y-4 py-4">
                            {passwordError && (
                                <div className="bg-red-500/10 text-red-600 text-sm p-3 rounded-md font-medium">
                                    {passwordError}
                                </div>
                            )}
                            {passwordSuccess && (
                                <div className="bg-green-500/10 text-green-600 text-sm p-3 rounded-md font-medium">
                                    {passwordSuccess}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input
                                    id="new-password"
                                    type="password"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={passwordLoading}>
                                {passwordLoading ? "Updating..." : "Update Password"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
