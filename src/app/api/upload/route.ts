import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { verifyToken } from '@/lib/auth'
import sharp from 'sharp'

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

/**
 * Compress an image buffer to WebP format using Sharp.
 * - Max width 1920px (auto height to maintain aspect ratio)
 * - WebP quality 80%
 * - Strips metadata (EXIF, etc.) to save bytes
 */
async function compressImage(inputBuffer: Buffer | Uint8Array): Promise<{ buffer: Buffer; originalSize: number; compressedSize: number }> {
    const originalSize = inputBuffer.length

    const compressedBuffer = await sharp(inputBuffer)
        .resize({
            width: 1920,
            withoutEnlargement: true, // Don't upscale small images
        })
        .webp({
            quality: 80,
            effort: 4, // Balance between speed and compression
        })
        .toBuffer()

    console.log(`[Upload] Compressed: ${(originalSize / 1024).toFixed(1)}KB → ${(compressedBuffer.length / 1024).toFixed(1)}KB (${((1 - compressedBuffer.length / originalSize) * 100).toFixed(0)}% saved)`)

    return {
        buffer: compressedBuffer,
        originalSize,
        compressedSize: compressedBuffer.length,
    }
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

        const arrayBuffer = await file.arrayBuffer()
        const rawBuffer = Buffer.from(arrayBuffer)

        // ── Compress image to WebP ──
        const { buffer: compressedBuffer, originalSize, compressedSize } = await compressImage(rawBuffer)

        // Always use .webp extension after compression
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.webp`

        // Use admin client (service role) to bypass storage RLS
        const supabase = createAdminClient()

        const { data, error } = await supabase.storage
            .from('media')
            .upload(fileName, compressedBuffer, {
                contentType: 'image/webp',
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
            size: compressedSize,
            originalSize,
            type: 'image/webp',
        })
    } catch (err: any) {
        console.error('[Upload] Error:', err)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
}
