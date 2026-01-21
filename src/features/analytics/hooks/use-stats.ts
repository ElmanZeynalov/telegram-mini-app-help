import { useState, useEffect, useCallback } from "react"
import { AnalyticsStats, StatsPeriod } from "../types"

export function useStats(period: StatsPeriod = '7d', language: string = 'all') {
    const [stats, setStats] = useState<AnalyticsStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchStats = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`/api/analytics/stats?period=${period}&language=${language}`)
            if (!res.ok) throw new Error("Failed to fetch statistics")
            const data = await res.json()
            setStats(data)
        } catch (e) {
            console.error("Stats fetch error:", e)
            setError("Failed to load statistics")
        } finally {
            setLoading(false)
        }
    }, [period, language])

    useEffect(() => {
        fetchStats()
    }, [fetchStats])

    return { stats, loading, error, refetch: fetchStats }
}
