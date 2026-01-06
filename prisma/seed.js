
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const mockData = {
    categories: [
        { id: "cat-1", name: { az: "Ailə hüququ", ru: "Семейное право", en: "Family Law" } },
        { id: "cat-2", name: { az: "Əmək hüququ", ru: "Трудовое право", en: "Labor Law" } },
        { id: "cat-3", name: { az: "Mülkiyyət hüququ", ru: "Имущественное право", en: "Property Law" } }
    ],
    questions: [
        {
            categoryId: "cat-1",
            question: { az: "Boşanma prosesi necə həyata keçirilir?", ru: "Как осуществляется процесс развода?", en: "How is the divorce process carried out?" },
            answer: { az: "Ərizə verilməsi...", ru: "Подача заявления...", en: "Filing an application..." }
        }
    ]
}

async function main() {
    console.log('Seeding started...')

    // Clear existing data
    await prisma.questionTranslation.deleteMany()
    await prisma.question.deleteMany()
    await prisma.categoryTranslation.deleteMany()
    await prisma.category.deleteMany()

    // Seed Categories
    for (const cat of mockData.categories) {
        await prisma.category.create({
            data: {
                id: cat.id,
                translations: {
                    create: Object.entries(cat.name).map(([lang, name]) => ({
                        language: lang,
                        name: name
                    }))
                }
            }
        })
    }

    // Seed Questions
    for (const q of mockData.questions) {
        await prisma.question.create({
            data: {
                categoryId: q.categoryId,
                translations: {
                    create: Object.entries(q.question).map(([lang, text]) => ({
                        language: lang,
                        question: text,
                        answer: q.answer[lang]
                    }))
                }
            }
        })
    }

    console.log('Seeding finished.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
