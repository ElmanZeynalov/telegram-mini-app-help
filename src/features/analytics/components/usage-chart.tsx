"use client"

import { useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { UsageStat } from "../types"

interface UsageChartProps {
    data: UsageStat[]
}

export function UsageChart({ data }: UsageChartProps) {
    const [view, setView] = useState<'active' | 'new'>('active')

    return (
        <Card className="col-span-4">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-normal">
                    {view === 'active' ? 'Daily Active Users' : 'New Users'}
                </CardTitle>
                <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
                    <button
                        onClick={() => setView('active')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${view === 'active'
                            ? 'bg-background shadow-sm text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => setView('new')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${view === 'new'
                            ? 'bg-background shadow-sm text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        New
                    </button>
                </div>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="date"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}`}
                        />
                        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.4} />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '8px',
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                backgroundColor: 'hsl(var(--background))',
                                color: 'hsl(var(--foreground))'
                            }}
                            cursor={{ stroke: 'rgba(136, 132, 216, 0.4)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey={view === 'active' ? 'users' : 'newUsers'}
                            stroke={view === 'active' ? '#8884d8' : '#10b981'}
                            fillOpacity={1}
                            fill={`url(#${view === 'active' ? 'colorActive' : 'colorNew'})`}
                            animationDuration={300}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
