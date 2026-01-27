import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { subDays } from 'date-fns'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const question = searchParams.get('question')
        const period = searchParams.get('period') || '7d'

        if (!question) {
            return NextResponse.json({ error: 'Question parameter is required' }, { status: 400 })
        }

        const validPeriods: Record<string, number> = {
            '7d': 7,
            '30d': 30,
            '90d': 90
        }
        const periodKey = Object.keys(validPeriods).includes(period) ? period : '7d'
        const daysToLookBack = validPeriods[periodKey]
        const startDate = subDays(new Date(), daysToLookBack)

        // Find events that match the question text in metadata
        // Note: The 'question' param passed here is the cleaned/extracted name from the stats API.
        // We might need a loose match if the metadata structure varies, but let's try strict json path match first 
        // or filtering in memory if volume is low. 
        // Given we extract name in stats API using a helper, we should try to match that logic or use a broader search.
        // For simplicity and performance, let's assume the question text passed is accurate enough or use basic text search on the metadata column if possible (Postgres JSONB support).
        // Since Prisma + JSON filtering can be tricky with complex structures, we'll fetch feedback events and filter effectively.
        // However, fetching ALL feedback events might be heavy. 
        // Let's rely on the fact that we look for 'feedback_yes' or 'feedback_no'.

        const feedbackEvents = await prisma.analyticsEvent.findMany({
            where: {
                eventType: { in: ['feedback_yes', 'feedback_no'] },
                createdAt: { gte: startDate },
                user: { isNot: null } // Only interested in users with accounts (though anonymous sessions might exist, user asked for usernames)
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        username: true,
                        telegramId: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Filter in memory to match the question text
        // This duplicates the logic in stats/route.ts extractName somewhat
        const matchedEvents = feedbackEvents.filter(event => {
            const meta = event.metadata as any
            const q = meta?.questionText || meta?.question || 'Unknown'

            // We need to match the normalized name potentially.
            // If the user clicks "How to reset...", we look for that string.
            // Let's assume exact string match for now as the stats table groups by this exact string.
            // If the stats endpoint does normalization (e.g. taking 'en' from a translation object), we need to replicate that.
            // In stats/route.ts: extractName checks val[language] or val.az/en/ru or val.
            // The passed 'question' param comes from that same logic.
            // So we need to apply extractName to the event and see if it equals 'question'.

            // Simple helper duplication
            const getEventName = (val: any) => {
                if (!val) return 'Unknown'
                if (typeof val === 'string') return val
                // We don't have 'language' param here easily unless passed, but usually the aggregation key is the displayed text.
                // If the aggregation grouped different languages under one key, we'd have a problem.
                // But stats/route.ts groups by the *extracted* name. 
                // So if we extract name again, it should match.
                if (typeof val === 'object') {
                    // Since we don't know the exact lang context of the view unless we pass it, 
                    // we might miss if the aggregation was complex. 
                    // But usually it's just a string in 'questionText'.
                    return val.en || val.az || val.ru || Object.values(val)[0] || 'Unknown'
                }
                return String(val)
            }

            // In AnswerFeedback component, we send `questionText` as the question string directly. 
            // So it should be a string match.
            return (meta?.questionText === question) || (getEventName(meta?.question) === question)
        })

        const detailedFeedback: Record<string, {
            id: string,
            vote: 'yes' | 'no',
            count: number,
            user: any
        }> = {}

        matchedEvents.forEach(event => {
            const userId = event.user?.id
            if (!userId) return

            const vote = event.eventType === 'feedback_yes' ? 'yes' : 'no'
            const key = `${userId}-${vote}`

            if (detailedFeedback[key]) {
                detailedFeedback[key].count++
            } else {
                detailedFeedback[key] = {
                    id: event.id, // Keep one ID for key
                    vote,
                    count: 1,
                    user: event.user
                }
            }
        })

        return NextResponse.json(Object.values(detailedFeedback))

    } catch (error) {
        console.error('Feedback Details Error:', error)
        return NextResponse.json({ error: 'Failed to fetch details' }, { status: 500 })
    }
}
