"use client"

import { useState } from "react"
import { useStats } from "@/features/analytics/hooks/use-stats"
import { StatsHeader } from "@/features/analytics/components/stats-header"
import { KPIGrid } from "@/features/analytics/components/kpi-grid"
import { UsageChart } from "@/features/analytics/components/usage-chart"
import { RegionChart } from "@/features/analytics/components/region-chart"
import { ContentChart } from "@/features/analytics/components/content-chart"
import { QuestionInterestChart } from "@/features/analytics/components/question-interest-chart"
import { UserListTable } from "@/features/analytics/components/user-list-table"
import { FeedbackStatsTable } from "@/features/analytics/components/feedback-stats-table"
import { EmergencyExitList } from "@/features/analytics/components/emergency-exit-list"
import { StatsPeriod } from "@/features/analytics/types"

export default function AnalyticsPage() {
    const [period, setPeriod] = useState<StatsPeriod>('7d')
    const [language, setLanguage] = useState<string>('all')
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
    const { stats, loading, error, refetch } = useStats(period, language, 30000)

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

    // ... loading and error states ...

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
                onRefresh={refetch}
            />

            <KPIGrid
                safety={stats.safety}
                totalRegions={stats.regions.length}
            />

            <div className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-7">
                <UserListTable
                    regionFilter={selectedRegion}
                    onClearFilter={() => setSelectedRegion(null)}
                    className="col-span-1 md:col-span-2 lg:col-span-5"
                />
                <RegionChart
                    data={stats.regions}
                    onRegionSelect={(region) => setSelectedRegion(region === selectedRegion ? null : region)}
                    selectedRegion={selectedRegion}
                    className="col-span-1 md:col-span-1 lg:col-span-2"
                />

                <div className="col-span-1 md:col-span-3 lg:col-span-7 grid grid-cols-1 lg:grid-cols-7 gap-4">
                    <div className="lg:col-span-5">
                        <UsageChart data={stats.usage} />
                    </div>
                    <EmergencyExitList
                        users={stats.safety.emergencyExitUsers}
                        className="lg:col-span-2 h-full"
                    />
                </div>
            </div>

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                <ContentChart data={stats.content} className="col-span-1" />
                <QuestionInterestChart data={stats.questions} className="col-span-1" />
            </div>

            <FeedbackStatsTable data={stats.feedback} />
        </div>
    )
}
