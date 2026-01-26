"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Loader2, Users } from "lucide-react"
import { useRouter } from "next/navigation"
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

export default function UsersPage() {
    const router = useRouter()
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
        fetchUsers()
    }, [])

    return (
        <div className="p-6 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Users className="w-8 h-8" />
                        Users
                    </h1>
                    <p className="text-muted-foreground">
                        List of all users who have accessed the mini app.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Total Users: {users.length}</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Username</TableHead>
                                    <TableHead>Telegram ID</TableHead>
                                    <TableHead>Language</TableHead>
                                    <TableHead>Region</TableHead>
                                    <TableHead>Sessions</TableHead>
                                    <TableHead>Joined Date</TableHead>
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
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
