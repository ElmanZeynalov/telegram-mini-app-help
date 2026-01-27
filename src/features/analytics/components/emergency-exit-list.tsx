import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, User } from "lucide-react"

interface EmergencyExitUser {
    user: {
        id: string
        firstName: string | null
        lastName: string | null
        username: string | null
        telegramId: string | null
    } | undefined
    count: number
}

interface EmergencyExitListProps {
    users: EmergencyExitUser[] | undefined
    className?: string
}

export function EmergencyExitList({ users, className }: EmergencyExitListProps) {
    if (!users || users.length === 0) {
        return (
            <Card className={className}>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        Emergency Exits
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-muted-foreground text-center py-4">
                        No emergency exits recorded.
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className={className}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        Emergency Exits
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">Top {users.length}</span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                    {users.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                                    <User className="h-4 w-4 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium leading-none">
                                        {item.user ? (
                                            <>
                                                {item.user.firstName} {item.user.lastName}
                                            </>
                                        ) : 'Anonymous'}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {item.user?.username ? `@${item.user.username}` : (item.user?.telegramId || 'Unknown')}
                                    </p>
                                </div>
                            </div>
                            <div className="text-sm font-bold bg-secondary px-2 py-1 rounded-md">
                                {item.count}x
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
