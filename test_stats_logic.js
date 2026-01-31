
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { subDays } = require('date-fns');

async function main() {
    try {
        const daysToLookBack = 30; // 30 days
        const startDate = subDays(new Date(), daysToLookBack);

        // Simulate what the API does
        const viewEvents = await prisma.analyticsEvent.findMany({
            where: {
                eventType: { in: ['view_category', 'view_categories'] },
                createdAt: { gte: startDate }
            },
            select: { eventType: true, metadata: true }
        });

        console.log(`Found ${viewEvents.length} distinct view events.`);

        // Check distribution
        let viewCategoriesCount = 0;
        let viewCategoryCount = 0;

        viewEvents.forEach(e => {
            if (e.eventType === 'view_categories') viewCategoriesCount++;
            else if (e.eventType === 'view_category') viewCategoryCount++;
        });

        console.log(`view_categories: ${viewCategoriesCount}`);
        console.log(`view_category: ${viewCategoryCount}`);

        // Test extraction logic
        const categoryCounts = {};
        const language = 'all';

        const extractName = (val) => {
            if (!val) return 'Unknown';
            if (typeof val === 'string') return val;
            if (typeof val === 'object') {
                if (language !== 'all' && val[language]) return val[language];
                return val.az || val.en || val.ru || Object.values(val)[0] || 'Unknown';
            }
            return String(val);
        }

        viewEvents.forEach((event) => {
            if (event.eventType === 'view_categories') {
                const name = 'Categories Menu';
                categoryCounts[name] = (categoryCounts[name] || 0) + 1;
                return;
            }

            const rawName = event.metadata?.name;
            if (!rawName) return;

            const name = extractName(rawName);
            categoryCounts[name] = (categoryCounts[name] || 0) + 1;
        });

        console.log('Top Categories:', Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).slice(0, 5));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
