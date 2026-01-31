
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const questionId = 'd380cc86-07ab-40a9-a770-f610a0c3eea0';
        const question = await prisma.question.findUnique({
            where: { id: questionId },
            include: { subQuestions: true }
        });

        console.log('Question:', question);
        console.log('SubQuestions count:', question?.subQuestions?.length);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
