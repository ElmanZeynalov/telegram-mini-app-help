
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("--- USERS ---")
    const users = await prisma.user.findMany({
        select: { id: true, region: true, telegramId: true, _count: { select: { sessions: true, events: true } } }
    })
    console.log(JSON.stringify(users, null, 2))

    console.log("--- EVENTS SAMPLE ---")
    const events = await prisma.analyticsEvent.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { eventType: true, userId: true, metadata: true, user: { select: { region: true } } }
    })
    console.log(JSON.stringify(events, null, 2))
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })
