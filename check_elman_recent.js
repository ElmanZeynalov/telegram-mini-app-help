
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const telegramId = '545078224'; // Elman
        const user = await prisma.user.findUnique({ where: { telegramId } });

        if (user) {
            console.log(`Checking events for user ${user.id} (${user.firstName})...`);
            const events = await prisma.analyticsEvent.findMany({
                where: {
                    userId: user.id,
                    createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60) } // Last hour
                },
                orderBy: { createdAt: 'desc' }
            });
            console.log("Recent Events:", JSON.stringify(events, null, 2));
        } else {
            console.log("User not found.");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
