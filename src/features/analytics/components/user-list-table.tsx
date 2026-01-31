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
import { Loader2, X, Search } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useDebounce } from "use-debounce"

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

interface UserListTableProps {
    regionFilter?: string | null
    onClearFilter?: () => void
    className?: string
}

import { UserDetailDialog } from "./user-detail-dialog"

export function UserListTable({ regionFilter, onClearFilter, className }: UserListTableProps) {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedSearch] = useDebounce(searchQuery, 500)
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Construct URL with region filter and search query
                const params = new URLSearchParams()
                if (regionFilter) params.set('region', regionFilter)
                if (debouncedSearch) params.set('search', debouncedSearch)

                const url = `/api/admin/users?${params.toString()}`

                const res = await fetch(url)
                if (!res.ok) throw new Error('Failed to fetch users')
                const data = await res.json()
                setUsers(data)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }

        // Fetch immediately when filter changes
        setLoading(true)
        fetchUsers()

        // Poll every 30 seconds
        const interval = setInterval(fetchUsers, 30000)
        return () => clearInterval(interval)
    }, [regionFilter, debouncedSearch]) // Re-run when filter or search changes

    return (
        <Card className={`transition-all duration-300 ease-in-out ${className}`}>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                    <CardTitle>
                        {regionFilter
                            ? `Users in ${regionFilter} (${users.length})`
                            : `Recent Users (${users.length})`
                        }
                    </CardTitle>
                    {regionFilter && (
                        <p className="text-sm text-muted-foreground">
                            filtered by location
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search users..."
                            className="w-[200px] lg:w-[300px] pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {regionFilter && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClearFilter}
                            className="h-8 px-2 lg:px-3 text-muted-foreground hover:text-foreground"
                        >
                            <X className="mr-2 h-4 w-4" />
                            Clear Filter
                        </Button>
                    )}
                </div>
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
                                        <TableRow
                                            key={user.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => setSelectedUserId(user.id)}
                                        >
                                            <TableCell className="font-medium">
                                                <div>{user.firstName} {user.lastName}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    @{user.username || 'No username'}
                                                </div>
                                            </TableCell>
                                            <TableCell>{user.telegramId}</TableCell>
                                            <TableCell>{user.region || '-'}</TableCell>
                                            <TableCell>{(user.language || '-').toUpperCase()}</TableCell>
                                            <TableCell className="text-right">{user.sessionCount}</TableCell>
                                            <TableCell className="text-right">
                                                {format(new Date(user.createdAt), "MMM d, yyyy")}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </table>
                    </div>
                )}
            </CardContent>

            <UserDetailDialog
                userId={selectedUserId}
                onClose={() => setSelectedUserId(null)}
            />
        </Card >
    )
}
