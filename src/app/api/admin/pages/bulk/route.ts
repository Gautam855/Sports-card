import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/api/admin-auth'

/**
 * POST /api/admin/pages/bulk — Bulk create or update pages
 * Accepts a JSON array of pages (max 10 per batch to avoid overload).
 * Client should chunk large uploads into batches of 10.
 *
 * If a page with the same slug already exists, it is UPDATED (upsert).
 */
export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAdmin(req)
        if ('error' in auth) {
            return NextResponse.json({ error: auth.error }, { status: auth.status })
        }

        const body = await req.json()
        const { pages } = body

        if (!Array.isArray(pages) || pages.length === 0) {
            return NextResponse.json({ error: 'pages array is required' }, { status: 400 })
        }

        // Max 10 pages per batch to prevent server overload
        if (pages.length > 10) {
            return NextResponse.json({ error: 'Maximum 10 pages per batch. Send in smaller chunks.' }, { status: 400 })
        }

        const supabase = await createClient()

        // Validate and prepare all pages
        const validPages: any[] = []
        const errors: string[] = []

        for (let i = 0; i < pages.length; i++) {
            const p = pages[i]
            const rowNum = i + 1

            if (!p.title || !p.slug) {
                errors.push(`Row ${rowNum}: title and slug are required`)
                continue
            }

            // Validate slug format
            const slug = p.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
            if (!slug || slug.length < 2) {
                errors.push(`Row ${rowNum}: invalid slug "${p.slug}"`)
                continue
            }

            validPages.push({
                title: p.title.trim(),
                slug,
                page_title: p.page_title?.trim() || null,
                banner_image: p.banner_image?.trim() || null,
                html_content: p.html_content?.trim() || '',
                meta_title: p.meta_title?.trim() || null,
                meta_description: p.meta_description?.trim() || null,
                status: p.status === 'published' ? 'published' : 'draft',
                created_by: auth.userId,
            })
        }

        if (validPages.length === 0) {
            return NextResponse.json({ error: 'No valid pages to process', details: errors }, { status: 400 })
        }

        // Check which slugs already exist in the database
        const slugs = validPages.map(p => p.slug)
        const { data: existing } = await supabase
            .from('custom_pages')
            .select('id, slug')
            .in('slug', slugs)

        const existingMap = new Map((existing || []).map(e => [e.slug, e.id]))

        const toInsert: any[] = []
        const toUpdate: any[] = []

        for (const page of validPages) {
            if (existingMap.has(page.slug)) {
                toUpdate.push({ ...page, id: existingMap.get(page.slug) })
            } else {
                toInsert.push(page)
            }
        }

        let insertedCount = 0
        let updatedCount = 0

        // Insert new pages
        if (toInsert.length > 0) {
            const { data, error } = await supabase
                .from('custom_pages')
                .insert(toInsert)
                .select('id, title, slug, status')

            if (error) {
                console.error('[Bulk Upload] Insert error:', error.message)
                errors.push(`Insert error: ${error.message}`)
            } else {
                insertedCount = data?.length || 0
            }
        }

        // Update existing pages (including html_content)
        for (const page of toUpdate) {
            const { id, created_by, ...updateData } = page
            const { error } = await supabase
                .from('custom_pages')
                .update(updateData)
                .eq('id', id)

            if (error) {
                console.error(`[Bulk Upload] Update error for slug "${page.slug}":`, error.message)
                errors.push(`Update error for "${page.slug}": ${error.message}`)
            } else {
                updatedCount++
            }
        }

        return NextResponse.json({
            inserted: insertedCount,
            updated: updatedCount,
            skipped: validPages.length - insertedCount - updatedCount,
            errors,
        })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Bulk upload failed'
        console.error('[Bulk Upload] Error:', message)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

