
import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            include: {
                translations: true,
            },
            orderBy: {
                order: "asc",
            },
        })
        return NextResponse.json(categories)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, translations } = body // Expecting translations array or object

        // Create category
        const category = await prisma.category.create({
            data: {
                translations: {
                    create: translations, // [{ language: 'az', name: '...' }, ...]
                },
            },
            include: {
                translations: true
            }
        })

        return NextResponse.json(category)
    } catch (error) {
        return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json()
        const { id, translations } = body

        if (translations) {
            for (const t of translations) {
                await prisma.categoryTranslation.upsert({
                    where: {
                        categoryId_language: { categoryId: id, language: t.language }
                    },
                    update: { name: t.name },
                    create: { categoryId: id, language: t.language, name: t.name }
                })
            }
        }

        const category = await prisma.category.findUnique({
            where: { id },
            include: { translations: true }
        })
        return NextResponse.json(category)
    } catch (error) {
        return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

        await prisma.category.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
    }
}
