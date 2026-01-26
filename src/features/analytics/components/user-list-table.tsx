"use client"

import { useEffect, useState } from "react"
import {
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"

interface User {
    id: string
    telegramId: string
    firstName: string | null
    lastName: string | null
    username: string | null
    language: string
    region: string
    createdAt: string
    sessionCount: number
}

export function UserListTable() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/admin/users')
                if (!res.ok) throw new Error('Failed to fetch users')
                const data = await res.json()
                setUsers(data)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }

        // Initial fetch
        fetchUsers()

        // Poll every 5 seconds
        const interval = setInterval(fetchUsers, 5000)
        return () => clearInterval(interval)
    }, [])

    return (
        <Card className="col-span-4 lg:col-span-7 transition-all duration-300 ease-in-out">
            <CardHeader>
                <CardTitle>Recent Users ({users.length})</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex h-40 items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar relative">
                        <table className="w-full caption-bottom text-sm text-left">
                            <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="bg-card">Name</TableHead>
                                    <TableHead className="bg-card">Username</TableHead>
                                    <TableHead className="bg-card">Telegram ID</TableHead>
                                    <TableHead className="bg-card">Language</TableHead>
                                    <TableHead className="bg-card">Region</TableHead>
                                    <TableHead className="bg-card">Sessions</TableHead>
                                    <TableHead className="bg-card">Joined Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                            No users found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">
                                                {user.firstName} {user.lastName}
                                            </TableCell>
                                            <TableCell>
                                                {user.username ? `@${user.username}` : '-'}
                                            </TableCell>
                                            <TableCell>
                                                {user.telegramId || 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {user.language?.toUpperCase() || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {user.region || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {user.sessionCount}
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(user.createdAt), 'PP pp')}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
