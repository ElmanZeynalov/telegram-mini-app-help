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
            addRandomSuffix: true // Prevent file name collisions
        })

        return NextResponse.json(blob)
    } catch (error) {
        console.error("Upload error details:", error)
        return NextResponse.json({ error: "Upload failed", details: error instanceof Error ? error.message : String(error) }, { status: 500 })
    }
}

import { del } from '@vercel/blob'

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const urlToCheck = searchParams.get('url')

        if (!urlToCheck) {
            return NextResponse.json({ error: "Url required" }, { status: 400 })
        }

        await del(urlToCheck)

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Delete failed" }, { status: 500 })
    }
}
