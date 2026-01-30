import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { hash } from "bcryptjs"

export async function GET(request: Request) {
    try {
        const session = await getSession()
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const admins = await prisma.adminUser.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json({ admins })
    } catch (error) {
        console.error("Fetch admins error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getSession()
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: "Admin ID is required" }, { status: 400 })
        }

        if (id === session.user.id) {
            return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
        }

        await prisma.adminUser.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete admin error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await getSession()
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { id, password } = body

        if (!id || !password) {
            return NextResponse.json({ error: "ID and password are required" }, { status: 400 })
        }

        const hashedPassword = await hash(password, 12)

        await prisma.adminUser.update({
            where: { id },
            data: { password: hashedPassword }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Update password error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
