import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { eventType, metadata, telegramId, region, existingSessionId } = body

        // 1. Identity Resolution: Find or Create User
        let user = null
        const telegramIdStr = telegramId ? String(telegramId) : undefined

        // Extract Location from Headers (Vercel Geolocation)
        const city = request.headers.get('x-vercel-ip-city') || undefined

        // Extract language from metadata if available (for language_select event or similar)
        // OR rely on 'region' param in body if frontend sends language there (legacy compatibility)
        // Ideally frontend should send language explicitly.
        const language = metadata?.language || (region && (region === 'az' || region === 'ru') ? region : undefined)

        if (telegramIdStr) {
            user = await prisma.user.upsert({
                where: { telegramId: telegramIdStr },
                update: {
                    // Update City (region) if detected
                    ...(city ? { region: city } : {}),
                    // Update Language if detected
                    ...(language ? { language } : {})
                },
                create: {
                    telegramId: telegramIdStr,
                    region: city,
                    language: language
                }
            })
        } else {
            // For web users without telegram ID, we might create an anonymous user or just track session
            // But if we want metrics like "Unique Users", we ideally need a stable ID.
            // If none provided, we skip user linking for this event or create anonymous user if needed.
        }

        // 2. Session Management
        // If client sends a sessionId, check if valid. If not, create new.
        let sessionId = existingSessionId
        let session = null

        if (sessionId) {
            session = await prisma.session.findUnique({
                where: { id: sessionId }
            })
        }

        if (!session) {
            // Create new session
            session = await prisma.session.create({
                data: {
                    userId: user?.id
                }
            })
            sessionId = session.id
        } else if (user && !session.userId) {
            // Link anonymous session to user if they just logged in?
            // For now, just keep as is.
        }

        // 3. Log Event
        const event = await prisma.analyticsEvent.create({
            data: {
                sessionId,
                userId: user?.id,
                eventType,
                metadata: metadata || {}
            }
        })

        return NextResponse.json({ success: true, sessionId })
    } catch (error) {
        console.error('Analytics Error:', error)
        return NextResponse.json({ success: false }, { status: 500 })
    }
}
