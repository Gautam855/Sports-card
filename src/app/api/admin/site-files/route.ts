import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/api/admin-auth'
import { createClient } from '@/lib/supabase/server'

const BUCKET = 'site-files'
const ALLOWED_EXTENSIONS = ['.html', '.txt', '.xml', '.json']

/**
 * GET /api/admin/site-files — List all verification/SEO files
 */
export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAdmin(req)
        if ('error' in auth) {
            return NextResponse.json({ error: auth.error }, { status: auth.status })
        }

        const supabase = await createClient()
        const { data, error } = await supabase.storage.from(BUCKET).list('', {
            limit: 100,
            sortBy: { column: 'name', order: 'asc' }
        })

        if (error) throw error
        const files = (data || []).map(f => f.name)

        return NextResponse.json({ files })
    } catch (err: any) {
        return NextResponse.json({ error: err?.message ?? 'Failed to list files' }, { status: 500 })
    }
}

/**
 * POST /api/admin/site-files — Upload a verification file
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
        const ext = '.' + (file.name.split('.').pop() || '').toLowerCase()
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            return NextResponse.json(
                { error: `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` },
                { status: 400 }
            )
        }

        // Validate size (max 100KB)
        if (file.size > 100 * 1024) {
            return NextResponse.json({ error: 'File too large. Max 100KB.' }, { status: 400 })
        }

        // Sanitize filename
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '')
        if (!safeName) {
            return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
        }

        const arrayBuffer = await file.arrayBuffer()
        const buffer = new Uint8Array(arrayBuffer)

        const supabase = await createClient()
        const { error } = await supabase.storage.from(BUCKET).upload(safeName, buffer, {
            contentType: file.type || 'text/html',
            upsert: true,
        })

        if (error) throw error

        return NextResponse.json({ filename: safeName, size: file.size }, { status: 201 })
    } catch (err: any) {
        return NextResponse.json({ error: err?.message ?? 'Upload failed' }, { status: 500 })
    }
}

/**
 * DELETE /api/admin/site-files — Delete a verification file
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

        const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '')

        const supabase = await createClient()
        const { error } = await supabase.storage.from(BUCKET).remove([safeName])

        if (error) throw error
        return NextResponse.json({ success: true })
    } catch (err: any) {
        return NextResponse.json({ error: err?.message ?? 'Delete failed' }, { status: 500 })
    }
}
