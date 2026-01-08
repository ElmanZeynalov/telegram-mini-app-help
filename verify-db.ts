
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Checking database for attachments...')

    const translations = await prisma.questionTranslation.findMany({
        where: {
            attachmentUrl: {
                not: null
            }
        },
        select: {
            questionId: true,
            language: true,
            question: true,
            attachmentUrl: true,
            attachmentName: true
        }
    })

    if (translations.length === 0) {
        console.log('❌ No attachments found in the database!')
    } else {
        console.log(`✅ Found ${translations.length} attachments:`)
        translations.forEach(t => {
            console.log(`- [${t.language}] Question: "${t.question?.substring(0, 30)}..."`)
            console.log(`  URL: ${t.attachmentUrl}`)
            console.log(`  Name: ${t.attachmentName}`)
        })
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
