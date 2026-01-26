"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChevronDown, ChevronUp } from "lucide-react"
import { ContentStat } from "../types"

interface QuestionInterestChartProps {
    data: ContentStat[]
}

export function QuestionInterestChart({ data }: QuestionInterestChartProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    // Sort by views descending just in case
    const sortedData = [...data].sort((a, b) => b.views - a.views)
    const displayData = isExpanded ? sortedData : sortedData.slice(0, 5)

    // Calculate height: base height for 5 items (approx 300px) or grows with data
    // 50px per bar roughly + padding
    const height = Math.max(300, displayData.length * 60)

    return (
        <Card className="col-span-4 transition-all duration-300 ease-in-out">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Top Interest Questions</CardTitle>
                    <span className="text-sm text-muted-foreground">
                        {data.length} total
                    </span>
                </div>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={height}>
                    <BarChart
                        data={displayData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={240}
                            tick={({ x, y, payload }) => (
                                <g transform={`translate(${x},${y})`}>
                                    <text
                                        x={0}
                                        y={0}
                                        dy={4}
                                        textAnchor="end"
                                        fill="hsl(var(--foreground))"
                                        fontSize={11}
                                    >
                                        {payload.value.length > 35
                                            ? `${payload.value.substring(0, 35)}...`
                                            : payload.value}
                                    </text>
                                </g>
                            )}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{
                                borderRadius: '8px',
                                border: '1px solid #1E293B',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                                backgroundColor: '#020817',
                                color: '#F8FAFC'
                            }}
                            itemStyle={{ color: '#F8FAFC' }}
                            formatter={(value: number) => [value, "Baxış sayı"]}
                        />
                        <Bar dataKey="views" fill="#8884d8" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>

                {data.length > 5 && (
                    <div className="flex justify-center mt-4 pt-2 border-t">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                        >
                            {isExpanded ? (
                                <>
                                    Show Less <ChevronUp className="h-4 w-4" />
                                </>
                            ) : (
                                <>
                                    Show More ({data.length - 5} others) <ChevronDown className="h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
