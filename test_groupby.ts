
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        const language = 'all';

        // Test emergencyExitGroup
        console.log("Testing emergencyExitGroup...");
        const emergencyExitGroup = await prisma.analyticsEvent.groupBy({
            by: ['userId'],
            where: {
                eventType: 'emergency_exit',
                createdAt: { gte: startDate }
            },
            _count: { userId: true },
            orderBy: { _count: { userId: 'desc' } },
            take: 20
        });
        console.log("emergencyExitGroup result:", emergencyExitGroup);

        // Test regions
        console.log("Testing regions...");
        const regions = await prisma.user.groupBy({
            by: ['region'],
            _count: { region: true },
            where: {
                region: { not: null, notIn: ['az', 'ru', 'en'] }
            }
        });
        console.log("regions result:", regions);

    } catch (e) {
        console.error("Error executing queries:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
