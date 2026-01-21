"use client"

import { useState } from "react"
import { useStats } from "@/src/features/analytics/hooks/use-stats"
import { StatsHeader } from "@/src/features/analytics/components/stats-header"
import { KPIGrid } from "@/src/features/analytics/components/kpi-grid"
import { UsageChart } from "@/src/features/analytics/components/usage-chart"
import { RegionChart } from "@/src/features/analytics/components/region-chart"
import { ContentChart } from "@/src/features/analytics/components/content-chart"
import { QuestionInterestChart } from "@/src/features/analytics/components/question-interest-chart"
import { StatsPeriod } from "@/src/features/analytics/types"

export default function AnalyticsPage() {
    const [period, setPeriod] = useState<StatsPeriod>('7d')
    const [language, setLanguage] = useState<string>('all')
    const { stats, loading, error } = useStats(period, language)

    const handleExport = () => {
        if (!stats) return
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stats, null, 2))
        const downloadAnchorNode = document.createElement('a')
        downloadAnchorNode.setAttribute("href", dataStr)
        downloadAnchorNode.setAttribute("download", `analytics_export_${period}_${language}.json`)
        document.body.appendChild(downloadAnchorNode)
        downloadAnchorNode.click()
        downloadAnchorNode.remove()
    }

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (error || !stats) {
        return (
            <div className="p-8 text-center text-red-500">
                {error || "Failed to load statistics."}
            </div>
        )
    }

    return (
        <div className="p-6 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            <StatsHeader
                period={period}
                setPeriod={(val) => setPeriod(val as StatsPeriod)}
                language={language}
                setLanguage={setLanguage}
                onExport={handleExport}
            />

            <KPIGrid
                safety={stats.safety}
                totalRegions={stats.regions.length}
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <UsageChart data={stats.usage} />
                <RegionChart data={stats.regions} />
            </div>

            <ContentChart data={stats.content} />
            <QuestionInterestChart data={stats.questions} />
        </div>
    )
}

