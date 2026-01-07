
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const questions = await prisma.question.findMany({
        include: {
            translations: true
        }
    })

    console.log("Checking DB for attachments...")
    let found = false
    questions.forEach(q => {
        q.translations.forEach(t => {
            if (t.attachmentUrl) {
                console.log(`Found attachment for Q: ${q.id}, Lang: ${t.language}`)
                console.log(`URL: ${t.attachmentUrl}`)
                console.log(`Name: ${t.attachmentName}`)
                found = true
            }
        })
    })

    if (!found) {
        console.log("No attachments found in any question translation.")
    } else {
        console.log("Attachments exist in DB.")
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
