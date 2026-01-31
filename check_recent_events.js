
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const recentEvents = await prisma.analyticsEvent.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20,
            select: { eventType: true, createdAt: true }
        });

        console.log('Recent Events:', JSON.stringify(recentEvents, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
