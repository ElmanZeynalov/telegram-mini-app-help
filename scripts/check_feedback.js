const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("Checking for Feedback events...")

    const count = await prisma.analyticsEvent.count({
        where: {
            eventType: { in: ['feedback_yes', 'feedback_no'] }
        }
    })
    console.log(`Total Feedback Events: ${count}`)

    if (count > 0) {
        const events = await prisma.analyticsEvent.findMany({
            where: {
                eventType: { in: ['feedback_yes', 'feedback_no'] }
            },
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: { user: true }
        })

        console.log("Latest 10 Events:")
        console.log(JSON.stringify(events, null, 2))
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })
