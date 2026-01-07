
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const parentId = searchParams.get('parentId')

    try {
        const where: any = {}
        if (categoryId) where.categoryId = categoryId
        if (parentId) where.parentId = parentId
        else if (categoryId) where.parentId = null // Get root questions for category

        const questions = await prisma.question.findMany({
            where,
            include: {
                translations: true,
                subQuestions: {
                    include: { translations: true }
                }
            },
            orderBy: {
                order: "asc",
            },
        })

        // Helper to format question
        const formatQuestion = (q: any) => ({
            ...q,
            question: q.translations.reduce((acc: any, t: any) => ({ ...acc, [t.language]: t.question }), {}),
            answer: q.translations.reduce((acc: any, t: any) => ({ ...acc, [t.language]: t.answer }), {}),
            attachments: q.translations.reduce((acc: any, t: any) => ({
                ...acc,
                [t.language]: t.attachmentUrl ? { url: t.attachmentUrl, name: t.attachmentName } : null
            }), {}),
            subQuestions: q.subQuestions?.map(formatQuestion) || []
        })

        return NextResponse.json(questions.map(formatQuestion))
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { categoryId, parentId, translations } = body

        if (!translations || !Array.isArray(translations) || translations.length === 0) {
            return NextResponse.json({ error: "Translations are required" }, { status: 400 })
        }

        const question = await prisma.question.create({
            data: {
                categoryId,
                parentId,
                translations: {
                    create: translations,
                },
            },
            include: {
                translations: true
            }
        })

        const formattedQuestion = {
            ...question,
            question: question.translations.reduce((acc: any, t: any) => ({ ...acc, [t.language]: t.question }), {}),
            answer: question.translations.reduce((acc: any, t: any) => ({ ...acc, [t.language]: t.answer }), {}),
            subQuestions: []
        }

        return NextResponse.json(formattedQuestion)
    } catch (error) {
        return NextResponse.json({ error: "Failed to create question" }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json()
        const { id, translations } = body

        if (translations) {
            // Fetch existing translations to find a fallback title (e.g. AZ)
            const existingQ = await prisma.question.findUnique({
                where: { id },
                include: { translations: true }
            })

            if (!existingQ) return NextResponse.json({ error: "Question not found" }, { status: 404 })

            const fallbackTitle = existingQ.translations.find(t => t.language === 'az')?.question
                || existingQ.translations.find(t => t.question?.length > 0)?.question
                || "New Question"

            for (const t of translations) {
                // Determine valid question text:
                // 1. If provided in payload and not empty, use it.
                // 2. If creating new record, MUST use fallback if provided is empty.
                const titleForCreate = (t.question && t.question.trim().length > 0) ? t.question : fallbackTitle

                // For update: If payload has empty string, do we overwrite? 
                // If we are editing ANSWER only, frontend might send empty question or fallback.
                // Safest: If payload question is empty/falsy, do NOT update the DB field (use undefined).
                const titleForUpdate = (t.question && t.question.trim().length > 0) ? t.question : undefined

                await prisma.questionTranslation.upsert({
                    where: {
                        questionId_language: { questionId: id, language: t.language }
                    },
                    update: {
                        answer: t.answer,
                        ...(t.attachmentUrl !== undefined ? { attachmentUrl: t.attachmentUrl } : {}),
                        ...(t.attachmentName !== undefined ? { attachmentName: t.attachmentName } : {}),
                        ...(titleForUpdate ? { question: titleForUpdate } : {})
                    },
                    create: {
                        questionId: id,
                        language: t.language,
                        question: titleForCreate,
                        answer: t.answer,
                        attachmentUrl: t.attachmentUrl,
                        attachmentName: t.attachmentName
                    }
                })
            }
        }

        // Fetch updated
        const question = await prisma.question.findUnique({
            where: { id },
            include: { translations: true, subQuestions: { include: { translations: true } } }
        })

        if (!question) return NextResponse.json({ error: "Question not found" }, { status: 404 })

        const formatQuestion = (q: any) => ({
            ...q,
            question: q.translations.reduce((acc: any, t: any) => ({ ...acc, [t.language]: t.question }), {}),
            answer: q.translations.reduce((acc: any, t: any) => ({ ...acc, [t.language]: t.answer }), {}),
            attachments: q.translations.reduce((acc: any, t: any) => ({
                ...acc,
                [t.language]: t.attachmentUrl ? { url: t.attachmentUrl, name: t.attachmentName } : null
            }), {}),
            subQuestions: q.subQuestions?.map(formatQuestion) || []
        })

        return NextResponse.json(formatQuestion(question))
    } catch (error) {
        console.error("PUT Error:", error)
        return NextResponse.json({ error: "Failed to update question" }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

        await prisma.question.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete question" }, { status: 500 })
    }
}
