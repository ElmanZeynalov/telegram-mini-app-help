
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const sessionCount = await prisma.session.count();
        const eventCount = await prisma.analyticsEvent.count();
        const userCount = await prisma.user.count();

        console.log(`Sessions: ${sessionCount}`);
        console.log(`Events: ${eventCount}`);
        console.log(`Users: ${userCount}`);

        // Check if any event has metadata
        const sampleEvents = await prisma.analyticsEvent.findMany({ take: 5 });
        console.log('Sample Events:', JSON.stringify(sampleEvents, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
