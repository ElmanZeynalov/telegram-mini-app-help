import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const users = await prisma.user.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                telegramId: true,
                firstName: true,
                lastName: true,
                username: true,
                language: true,
                region: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: { sessions: true }
                }
            }
        })

        const formattedUsers = users.map(user => ({
            id: user.id,
            telegramId: user.telegramId,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            language: user.language,
            region: user.region,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            sessionCount: user._count.sessions
        }))

        return NextResponse.json(formattedUsers)
    } catch (error) {
        console.error('Failed to fetch users:', error)
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }
}
