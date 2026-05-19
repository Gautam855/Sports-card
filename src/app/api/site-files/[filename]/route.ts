import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const BUCKET = 'site-files'

/**
 * GET /api/site-files/[filename] — Serve a verification file from Supabase Storage
 * This is the public endpoint that rewrites like /googleXXX.html point to.
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    try {
        const { filename } = await params

        if (!filename) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }

        const supabase = await createClient()
        const { data, error } = await supabase.storage.from(BUCKET).download(filename)

        if (error || !data) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }

        // Determine content type
        const ext = filename.split('.').pop()?.toLowerCase()
        const contentTypes: Record<string, string> = {
            html: 'text/html',
            txt: 'text/plain',
            xml: 'application/xml',
            json: 'application/json',
        }

        const contentType = contentTypes[ext || ''] || 'text/plain'
        const body = await data.text()

        return new NextResponse(body, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600',
            },
        })
    } catch {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
}
