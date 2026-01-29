import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const region = searchParams.get('region')
        const search = searchParams.get('search')

        const whereClause: any = {}

        if (region) {
            whereClause.region = {
                contains: region,
                mode: 'insensitive'
            }
        }

        if (search) {
            whereClause.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { username: { contains: search, mode: 'insensitive' } },
                { telegramId: { contains: search, mode: 'insensitive' } }
            ]
        }

        const users = await prisma.user.findMany({
            where: whereClause,
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
