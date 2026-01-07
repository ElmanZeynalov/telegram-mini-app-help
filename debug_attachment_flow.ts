
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("🚀 Starting End-to-End Attachment Debug...")

    // 1. Create a Test Question
    console.log("\n1. Creating Test Question...")
    const created = await prisma.question.create({
        data: {
            translations: {
                create: {
                    language: 'az',
                    question: 'Debug Question ' + Date.now(),
                    answer: 'Debug Answer'
                }
            }
        },
        include: { translations: true }
    })
    console.log("✅ Created ID:", created.id)

    // 2. Update with Attachment (Simulating API PUT)
    console.log("\n2. Updating with Attachment via Prisma (Simulating API logic)...")

    const attachmentUrl = "https://example.com/test.pdf"
    const attachmentName = "test.pdf"

    // This mirrors the logic in app/api/questions/route.ts PUT
    const updatePayload = {
        attachmentUrl,
        attachmentName
    }

    const updated = await prisma.questionTranslation.update({
        where: {
            questionId_language: {
                questionId: created.id,
                language: 'az'
            }
        },
        data: updatePayload
    })

    console.log("Update Result:", updated)

    // 3. Verify Persistence
    console.log("\n3. Verifying Persistence...")
    const verify = await prisma.question.findUnique({
        where: { id: created.id },
        include: { translations: true }
    })

    const azTranslation = verify?.translations.find(t => t.language === 'az')

    if (azTranslation?.attachmentUrl === attachmentUrl) {
        console.log("✅ SUCCESS: Attachment verified in DB!")
    } else {
        console.error("❌ FAILURE: Attachment NOT found in DB!")
        console.error("Actual:", azTranslation)
    }

    // 4. Cleanup
    await prisma.question.delete({ where: { id: created.id } })
    console.log("\n🧹 Cleanup done.")
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
