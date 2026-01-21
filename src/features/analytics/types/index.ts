export interface UsageStat {
    date: string
    users: number
}

export interface ContentStat {
    name: string
    views: number
}

export interface SafetyStat {
    totalEmergencyExits: number
    totalSessions: number
}

export interface RegionStat {
    name: string
    value: number
}

export interface AnalyticsStats {
    usage: UsageStat[]
    content: ContentStat[]
    questions: ContentStat[]
    safety: SafetyStat
    regions: RegionStat[]
}

export type StatsPeriod = '7d' | '30d' | '90d'
