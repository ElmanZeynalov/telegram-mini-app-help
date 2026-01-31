
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const viewCategory = await prisma.analyticsEvent.findFirst({
            where: { eventType: 'view_category' },
            select: { eventType: true, metadata: true, createdAt: true }
        });

        const viewCategories = await prisma.analyticsEvent.findFirst({
            where: { eventType: 'view_categories' },
            select: { eventType: true, metadata: true, createdAt: true }
        });

        console.log('view_category:', JSON.stringify(viewCategory, null, 2));
        console.log('view_categories:', JSON.stringify(viewCategories, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
