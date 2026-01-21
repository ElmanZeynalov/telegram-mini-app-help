import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, AlertTriangle, Users } from "lucide-react"
import { SafetyStat, RegionStat } from "../types"

interface KPIGridProps {
    safety: SafetyStat
    totalRegions: number
}

export function KPIGrid({ safety, totalRegions }: KPIGridProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{safety.totalSessions.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">All time interaction sessions</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Emergency Exits</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{safety.totalEmergencyExits.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Times "Emergency Exit" triggered</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Regions</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalRegions}</div>
                    <p className="text-xs text-muted-foreground">Distinct languages/regions</p>
                </CardContent>
            </Card>
        </div>
    )
}
