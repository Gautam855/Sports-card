import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * Create a Supabase admin client using the SERVICE_ROLE_KEY.
 * This bypasses RLS so the server can upload to storage
 * without needing a Supabase Auth session.
 */
function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    if (!serviceKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables')
    }
    return createSupabaseClient(url, serviceKey)
}

export async function POST(req: NextRequest) {
    try {
        // ── Auth: verify our custom JWT (not Supabase Auth) ──
        const authHeader = req.headers.get('authorization')
        const token = authHeader?.startsWith('Bearer ')
            ? authHeader.slice(7)
            : req.cookies.get('sp_auth_token')?.value

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized – no token' }, { status: 401 })
        }

        const payload = await verifyToken(token)
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized – invalid token' }, { status: 401 })
        }

        const formData = await req.formData()
        const file = formData.get('file') as File | null
        const folder = (formData.get('folder') as string) || 'blog-images'

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Allowed: JPG, PNG, WebP, GIF, AVIF' }, { status: 400 })
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File too large. Max 5MB.' }, { status: 400 })
        }

        const ext = file.name.split('.').pop() || 'jpg'
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`

        const arrayBuffer = await file.arrayBuffer()
        const buffer = new Uint8Array(arrayBuffer)

        // Use admin client (service role) to bypass storage RLS
        const supabase = createAdminClient()

        const { data, error } = await supabase.storage
            .from('media')
            .upload(fileName, buffer, {
                contentType: file.type,
                cacheControl: '31536000', // 1 year cache
                upsert: false,
            })

        if (error) {
            console.error('[Upload] Storage error:', error.message)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Get public URL
        const { data: urlData } = supabase.storage.from('media').getPublicUrl(data.path)

        return NextResponse.json({
            url: urlData.publicUrl,
            path: data.path,
            size: file.size,
            type: file.type,
        })
    } catch (err: any) {
        console.error('[Upload] Error:', err)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
}
