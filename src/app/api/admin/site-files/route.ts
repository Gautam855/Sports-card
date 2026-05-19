import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/api/admin-auth'
import fs from 'fs/promises'
import path from 'path'

const PUBLIC_DIR = path.join(process.cwd(), 'public')

// Only allow safe file extensions for verification/SEO files
const ALLOWED_EXTENSIONS = ['.html', '.txt', '.xml', '.json']

/**
 * GET /api/admin/site-files — List root-level verification/SEO files in public/
 */
export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAdmin(req)
        if ('error' in auth) {
            return NextResponse.json({ error: auth.error }, { status: auth.status })
        }

        const entries = await fs.readdir(PUBLIC_DIR, { withFileTypes: true })
        const files = entries
            .filter(e => e.isFile() && ALLOWED_EXTENSIONS.some(ext => e.name.endsWith(ext)))
            .map(e => e.name)

        return NextResponse.json({ files })
    } catch (err: any) {
        return NextResponse.json({ error: err?.message ?? 'Failed to list files' }, { status: 500 })
    }
}

/**
 * POST /api/admin/site-files — Upload a file to public/
 */
export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAdmin(req)
        if ('error' in auth) {
            return NextResponse.json({ error: auth.error }, { status: auth.status })
        }

        const formData = await req.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Validate extension
        const ext = path.extname(file.name).toLowerCase()
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            return NextResponse.json(
                { error: `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` },
                { status: 400 }
            )
        }

        // Validate size (max 100KB — verification files are tiny)
        if (file.size > 100 * 1024) {
            return NextResponse.json({ error: 'File too large. Max 100KB.' }, { status: 400 })
        }

        // Sanitize filename — keep only alphanumeric, dots, hyphens
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '')
        if (!safeName) {
            return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
        }

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        await fs.writeFile(path.join(PUBLIC_DIR, safeName), buffer)

        return NextResponse.json({ filename: safeName, size: file.size }, { status: 201 })
    } catch (err: any) {
        return NextResponse.json({ error: err?.message ?? 'Upload failed' }, { status: 500 })
    }
}

/**
 * DELETE /api/admin/site-files — Delete a file from public/
 */
export async function DELETE(req: NextRequest) {
    try {
        const auth = await verifyAdmin(req)
        if ('error' in auth) {
            return NextResponse.json({ error: auth.error }, { status: auth.status })
        }

        const { searchParams } = new URL(req.url)
        const filename = searchParams.get('filename')

        if (!filename) {
            return NextResponse.json({ error: 'Filename is required' }, { status: 400 })
        }

        // Prevent path traversal
        const safeName = path.basename(filename)
        const filePath = path.join(PUBLIC_DIR, safeName)

        // Don't allow deleting critical files
        const PROTECTED = ['favicon.ico', 'robots.txt', 'sitemap.xml']
        if (PROTECTED.includes(safeName)) {
            return NextResponse.json({ error: 'Cannot delete protected file' }, { status: 403 })
        }

        await fs.unlink(filePath)
        return NextResponse.json({ success: true })
    } catch (err: any) {
        return NextResponse.json({ error: err?.message ?? 'Delete failed' }, { status: 500 })
    }
}
