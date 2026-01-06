
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

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
        return NextResponse.json(questions)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { categoryId, parentId, translations } = body

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

        return NextResponse.json(question)
    } catch (error) {
        return NextResponse.json({ error: "Failed to create question" }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json()
        const { id, translations } = body

        if (translations) {
            for (const t of translations) {
                await prisma.questionTranslation.upsert({
                    where: {
                        questionId_language: { questionId: id, language: t.language }
                    },
                    update: { question: t.question, answer: t.answer },
                    create: { questionId: id, language: t.language, question: t.question, answer: t.answer }
                })
            }
        }

        // Fetch updated
        const question = await prisma.question.findUnique({
            where: { id },
            include: { translations: true }
        })
        return NextResponse.json(question)
    } catch (error) {
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
