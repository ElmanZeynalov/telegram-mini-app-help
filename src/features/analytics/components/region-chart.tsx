"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { RegionStat } from "../types"

interface RegionChartProps {
    data: RegionStat[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export function RegionChart({ data }: RegionChartProps) {
    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>User Cities</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] overflow-y-auto pr-2 space-y-2">
                    {data.length === 0 ? (
                        <div className="text-center text-muted-foreground pt-10">No city data available</div>
                    ) : (
                        data.map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50 transition-colors border">
                                <span className="font-medium text-sm">{item.name}</span>
                                <span className="font-bold text-primary">{item.value}</span>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
