"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, FileText, Settings, UserPlus } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link href="/miniapp/admin/users">
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                        <CardHeader>
                            <Users className="w-8 h-8 mb-2 text-primary" />
                            <CardTitle>User Management</CardTitle>
                            <CardDescription>Add new admin users and manage access</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                {/* Placeholder for other admin features */}
                <Card className="opacity-50">
                    <CardHeader>
                        <FileText className="w-8 h-8 mb-2 text-muted-foreground" />
                        <CardTitle>Content Management</CardTitle>
                        <CardDescription>Manage questions and categories (Coming Soon)</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        </div>
    )
}
