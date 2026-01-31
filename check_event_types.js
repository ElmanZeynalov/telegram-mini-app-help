
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const eventTypes = await prisma.analyticsEvent.groupBy({
            by: ['eventType'],
            _count: {
                eventType: true,
            },
        });

        console.log('Event Types:', JSON.stringify(eventTypes, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
