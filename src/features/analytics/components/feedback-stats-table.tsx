"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThumbsUp, ThumbsDown } from "lucide-react"

interface FeedbackStat {
    question: string
    yes: number
    no: number
    total: number
}

interface FeedbackStatsTableProps {
    data?: FeedbackStat[]
}

export function FeedbackStatsTable({ data = [] }: FeedbackStatsTableProps) {
    return (
        <Card className="col-span-4 lg:col-span-7 transition-all duration-300 ease-in-out">
            <CardHeader>
                <CardTitle>Feedback Statistics (Top Questions)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar relative">
                    <table className="w-full caption-bottom text-sm text-left">
                        <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="bg-card w-[50%]">Question</TableHead>
                                <TableHead className="bg-card text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <ThumbsUp className="w-4 h-4 text-primary" />
                                        Yes
                                    </div>
                                </TableHead>
                                <TableHead className="bg-card text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <ThumbsDown className="w-4 h-4 text-muted-foreground" />
                                        No
                                    </div>
                                </TableHead>
                                <TableHead className="bg-card text-right">Total Votes</TableHead>
                                <TableHead className="bg-card text-right">Satisfaction</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No feedback data yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((item, index) => {
                                    const satisfaction = item.total > 0 ? Math.round((item.yes / item.total) * 100) : 0
                                    return (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium truncate max-w-[300px]" title={item.question}>
                                                {item.question}
                                            </TableCell>
                                            <TableCell className="text-center text-primary font-medium">
                                                {item.yes}
                                            </TableCell>
                                            <TableCell className="text-center text-muted-foreground">
                                                {item.no}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {item.total}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className={`font-bold ${satisfaction >= 80 ? 'text-green-500' : satisfaction >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                                                    {satisfaction}%
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}
