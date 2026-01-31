
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const childId = '558b9c5a-4b86-4211-a513-c082487935fb';
        const question = await prisma.question.findUnique({
            where: { id: childId },
            include: { translations: true }
        });

        console.log('Child Question:', JSON.stringify(question, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
