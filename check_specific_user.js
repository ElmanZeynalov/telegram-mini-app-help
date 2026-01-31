
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const telegramId = '545078224'; // From screenshot

        // Find the user
        const user = await prisma.user.findUnique({
            where: { telegramId: telegramId }
        });

        console.log('User found:', user);

        if (user) {
            // Find recent events for this user
            const events = await prisma.analyticsEvent.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: 'desc' },
                take: 5
            });
            console.log('Recent events for this user:', JSON.stringify(events, null, 2));
        }

        // Also check the user from the recent successful event I saw earlier
        const recentEventUserId = '67508a9c-b64c-4eb1-8cdd-5c66782cea63';
        const otherUser = await prisma.user.findUnique({
            where: { id: recentEventUserId }
        });
        console.log(`User for recent event (${recentEventUserId}):`, otherUser);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
