import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { startOfDay, subDays, format } from 'date-fns'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const period = searchParams.get('period') || '7d'
        const language = searchParams.get('language') || 'all'

        const validPeriods: Record<string, number> = {
            '7d': 7,
            '30d': 30,
            '90d': 90
        }
        const periodKey = Object.keys(validPeriods).includes(period) ? period : '7d'
        const daysToLookBack = validPeriods[periodKey]

        // Calculate Usage Statistics (Daily Users)
        const startDate = subDays(new Date(), daysToLookBack)

        // Filter Usage (Sessions) by User Language
        const sessionFilter = language !== 'all' ? { user: { language: language } } : undefined

        // Filter events by the language recorded in metadata (if available)
        // If "all", no filter. If specific language, try to match metadata.language
        const eventFilter = language !== 'all'
            ? {
                AND: [
                    { metadata: { path: ['language'], equals: language } }
                ]
            }
            : undefined

        // 1. Daily Active Users
        const recentSessions = await prisma.session.findMany({
            where: {
                startTime: {
                    gte: startDate
                },
                ...sessionFilter
            },
            select: {
                startTime: true,
                userId: true
            }
        })

        const dailyStats: Record<string, number> = {}
        // Initialize days with 0
        for (let i = daysToLookBack - 1; i >= 0; i--) {
            const dateStr = format(subDays(new Date(), i), 'MMM dd')
            dailyStats[dateStr] = 0
        }

        recentSessions.forEach(session => {
            const dateStr = format(new Date(session.startTime), 'MMM dd')
            if (dailyStats[dateStr] !== undefined) {
                dailyStats[dateStr]++
            }
        })

        const usageData = Object.entries(dailyStats).map(([date, users]) => ({ date, users }))

        // Helper to extract string from metadata (which might be translation object)
        const extractName = (val: any) => {
            if (!val) return 'Unknown'
            if (typeof val === 'string') return val
            if (typeof val === 'object') {
                if (language !== 'all' && val[language]) return val[language]
                return val.az || val.en || val.ru || Object.values(val)[0] || 'Unknown'
            }
            return String(val)
        }

        // 2. Content Interest (Top Categories)
        const viewEvents = await prisma.analyticsEvent.findMany({
            where: {
                eventType: 'view_category',
                createdAt: { gte: startDate },
                ...eventFilter
            },
            select: {
                metadata: true
            }
        })

        const categoryCounts: Record<string, number> = {}
        viewEvents.forEach((event: any) => {
            const rawName = event.metadata?.name
            const name = extractName(rawName)
            categoryCounts[name] = (categoryCounts[name] || 0) + 1
        })

        const contentData = Object.entries(categoryCounts)
            .map(([name, views]) => ({ name, views }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 50)

        // 3. Top Questions
        const questionEvents = await prisma.analyticsEvent.findMany({
            where: {
                eventType: 'view_question',
                createdAt: { gte: startDate },
                ...eventFilter
            },
            select: {
                metadata: true
            }
        })

        const questionCounts: Record<string, number> = {}
        questionEvents.forEach((event: any) => {
            const rawName = event.metadata?.question || event.metadata?.text || event.metadata?.title
            const name = extractName(rawName)
            const shortName = name.length > 50 ? name.substring(0, 50) + '...' : name
            questionCounts[shortName] = (questionCounts[shortName] || 0) + 1
        })

        const questionData = Object.entries(questionCounts)
            .map(([name, views]) => ({ name, views }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 50)

        // 3. Drop-off / Flow
        const emergencyExits = await prisma.analyticsEvent.count({
            where: {
                eventType: 'emergency_exit',
                ...eventFilter
            }
        })

        const totalSessions = await prisma.session.count({
            where: {
                ...sessionFilter
            }
        })

        // 4. Region Distribution (If language filter ON, this chart will show 100% one region)
        // But logic is fine.
        // 4. Region Distribution (Cities)
        const regionFilter = language !== 'all' ? { language: language } : undefined

        const regionGroups = await prisma.user.groupBy({
            by: ['region'],
            _count: {
                region: true
            },
            where: {
                region: {
                    not: null,
                    // Filter out legacy language codes that might be stored in 'region'
                    notIn: ['az', 'ru', 'en']
                },
                ...regionFilter
            }
        })
        const regionData = regionGroups.map(g => ({
            name: g.region || 'Unknown',
            value: g._count.region
        }))

        return NextResponse.json({
            usage: usageData,
            content: contentData,
            questions: questionData,
            safety: {
                totalEmergencyExits: emergencyExits,
                totalSessions
            },
            regions: regionData
        })
    } catch (error) {
        console.error('Stats Error:', error)
        return NextResponse.json({ success: false }, { status: 500 })
    }
}
