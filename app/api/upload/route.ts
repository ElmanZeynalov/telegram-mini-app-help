import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const filename = searchParams.get('filename') || "file"

        if (!request.body) {
            return NextResponse.json({ error: "No body" }, { status: 400 })
        }

        // Upload to Vercel Blob
        const blob = await put(filename, request.body, {
            access: 'public',
        })

        return NextResponse.json(blob)
    } catch (error) {
        console.error("Upload error:", error)
        return NextResponse.json({ error: "Upload failed" }, { status: 500 })
    }
}
