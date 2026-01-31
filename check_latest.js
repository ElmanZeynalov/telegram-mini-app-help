
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const latestEvent = await prisma.analyticsEvent.findFirst({
            orderBy: { createdAt: 'desc' }
        });

        console.log('Latest Event:', JSON.stringify(latestEvent, null, 2));
        console.log('Current Server Time:', new Date().toISOString());

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
