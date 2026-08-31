import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/api/admin-auth'

// GET /api/admin/pages — List all custom pages
export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAdmin(req)
        if ('error' in auth) {
            return NextResponse.json({ error: auth.error }, { status: auth.status })
        }

        const supabase = await createClient()

        const { data: pages, error } = await supabase
            .from('custom_pages')
            .select('id, title, slug, status, meta_title, meta_description, created_by, created_at, updated_at')
            .order('created_at', { ascending: false })

        if (error) throw error

        // Stats
        const total = pages?.length ?? 0
        const published = pages?.filter(p => p.status === 'published').length ?? 0
        const draft = pages?.filter(p => p.status === 'draft').length ?? 0

        return NextResponse.json({
            pages: pages ?? [],
            stats: { total, published, draft },
        })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to fetch pages'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

// POST /api/admin/pages — Create a new custom page
export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAdmin(req)
        if ('error' in auth) {
            return NextResponse.json({ error: auth.error }, { status: auth.status })
        }

        const body = await req.json()
        const { title, slug, html_content, meta_title, meta_description, status } = body

        if (!title || !slug) {
            return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 })
        }

        // Validate slug format
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
            return NextResponse.json(
                { error: 'Slug must be lowercase letters, numbers, and hyphens only' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // Check for duplicate slug
        const { data: existing } = await supabase
            .from('custom_pages')
            .select('id')
            .eq('slug', slug)
            .maybeSingle()

        if (existing) {
            return NextResponse.json({ error: 'A page with this slug already exists' }, { status: 409 })
        }

        const { data, error } = await supabase
            .from('custom_pages')
            .insert({
                title,
                slug,
                html_content: html_content || '',
                meta_title: meta_title || null,
                meta_description: meta_description || null,
                status: status || 'draft',
                created_by: auth.userId,
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ page: data }, { status: 201 })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to create page'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
