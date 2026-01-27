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
                OR: [
                    { metadata: { path: ['language'], equals: language } },
                    { user: { language: language } }
                ]
            }
            : undefined

        const userFilter = language !== 'all' ? { language: language } : undefined
        const regionFilter = language !== 'all' ? { language: language } : undefined

        // Prepare all queries to run in parallel
        const filterOptions = {
            session: {
                where: {
                    startTime: { gte: startDate },
                    ...sessionFilter
                },
                select: { startTime: true, userId: true }
            },
            newUser: {
                where: {
                    createdAt: { gte: startDate },
                    ...userFilter
                },
                select: { createdAt: true }
            },
            viewCategory: {
                where: {
                    eventType: 'view_category',
                    createdAt: { gte: startDate },
                    ...eventFilter
                },
                select: { metadata: true }
            },
            viewQuestion: {
                where: {
                    eventType: 'view_question',
                    createdAt: { gte: startDate },
                    ...eventFilter
                },
                select: { metadata: true }
            },
            emergencyExitCount: {
                where: {
                    eventType: 'emergency_exit',
                    ...eventFilter
                }
            },
            emergencyExitGroup: {
                by: ['userId'],
                where: {
                    eventType: 'emergency_exit',
                    createdAt: { gte: startDate },
                    ...eventFilter
                },
                _count: { userId: true },
                orderBy: { _count: { userId: 'desc' as const } },
                take: 20
            },
            totalSessions: {
                where: { ...sessionFilter }
            },
            totalUsers: {
                where: { ...userFilter }
            },
            regions: {
                by: ['region'],
                _count: { region: true },
                where: {
                    region: { not: null, notIn: ['az', 'ru', 'en'] },
                    ...regionFilter
                }
            },
            feedback: {
                where: {
                    eventType: { in: ['feedback_yes', 'feedback_no'] },
                    createdAt: { gte: startDate },
                    ...eventFilter
                },
                select: { eventType: true, metadata: true }
            }
        }

        const [
            recentSessions,
            newUsersData,
            viewEvents,
            questionEvents,
            emergencyExits,
            emergencyExitUsersGroup,
            totalSessions,
            totalUsers,
            regionGroups,
            feedbackEvents
        ] = await Promise.all([
            prisma.session.findMany(filterOptions.session),
            prisma.user.findMany(filterOptions.newUser),
            prisma.analyticsEvent.findMany(filterOptions.viewCategory),
            prisma.analyticsEvent.findMany(filterOptions.viewQuestion),
            prisma.analyticsEvent.count(filterOptions.emergencyExitCount),
            prisma.analyticsEvent.groupBy(filterOptions.emergencyExitGroup),
            prisma.session.count(filterOptions.totalSessions),
            prisma.user.count(filterOptions.totalUsers),
            prisma.user.groupBy(filterOptions.regions),
            prisma.analyticsEvent.findMany(filterOptions.feedback)
        ])

        const dailyStats: Record<string, { active: number, new: number }> = {}
        // Initialize days with 0
        for (let i = daysToLookBack - 1; i >= 0; i--) {
            const dateStr = format(subDays(new Date(), i), 'MMM dd')
            dailyStats[dateStr] = { active: 0, new: 0 }
        }

        // Count Active Users (Sessions)
        recentSessions.forEach(session => {
            const dateStr = format(new Date(session.startTime), 'MMM dd')
            if (dailyStats[dateStr]) {
                dailyStats[dateStr].active++
            }
        })

        // Count New Users (Registrations)
        newUsersData.forEach(user => {
            const dateStr = format(new Date(user.createdAt), 'MMM dd')
            if (dailyStats[dateStr]) {
                dailyStats[dateStr].new++
            }
        })

        const usageData = Object.entries(dailyStats).map(([date, stats]) => ({
            date,
            users: stats.active,
            newUsers: stats.new
        }))

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

        // Process Emergency Exit Users
        const userIds = emergencyExitUsersGroup.map(g => g.userId).filter(id => id !== null) as string[]
        // We need to fetch details for these users
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, firstName: true, lastName: true, username: true, telegramId: true }
        })

        const emergencyExitUsers = emergencyExitUsersGroup.map(g => {
            if (!g.userId) return null
            const user = users.find(u => u.id === g.userId)
            return {
                user,
                count: (g as any)._count?.userId || 0
            }
        }).filter(item => item !== null)

        // Process Region Data
        const regionData = regionGroups.map(g => ({
            name: g.region || 'Unknown',
            value: (g as any)._count?.region || 0
        }))

        const feedbackMap: Record<string, { yes: number, no: number }> = {}

        feedbackEvents.forEach((event: any) => {
            const question = extractName(event.metadata?.questionText || 'Unknown Question')
            if (!feedbackMap[question]) feedbackMap[question] = { yes: 0, no: 0 }

            if (event.eventType === 'feedback_yes') feedbackMap[question].yes++
            else feedbackMap[question].no++
        })

        const feedbackData = Object.entries(feedbackMap).map(([question, counts]) => ({
            question,
            yes: counts.yes,
            no: counts.no,
            total: counts.yes + counts.no
        })).sort((a, b) => b.total - a.total).slice(0, 50)

        return NextResponse.json({
            usage: usageData,
            content: contentData,
            questions: questionData,
            feedback: feedbackData,
            safety: {
                totalEmergencyExits: emergencyExits,
                totalSessions,
                totalUsers,
                emergencyExitUsers
            },
            regions: regionData
        })
    } catch (error) {
        console.error('Stats Error:', error)
        return NextResponse.json({ success: false }, { status: 500 })
    }
}
