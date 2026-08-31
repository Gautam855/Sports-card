import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/api/admin-auth'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET /api/admin/pages/[id] — Get single page
export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const auth = await verifyAdmin(req)
        if ('error' in auth) {
            return NextResponse.json({ error: auth.error }, { status: auth.status })
        }

        const { id } = await params
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('custom_pages')
            .select('*')
            .eq('id', id)
            .single()

        if (error || !data) {
            return NextResponse.json({ error: 'Page not found' }, { status: 404 })
        }

        return NextResponse.json({ page: data })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to fetch page'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

// PUT /api/admin/pages/[id] — Update page
export async function PUT(req: NextRequest, { params }: RouteParams) {
    try {
        const auth = await verifyAdmin(req)
        if ('error' in auth) {
            return NextResponse.json({ error: auth.error }, { status: auth.status })
        }

        const { id } = await params
        const body = await req.json()
        const { title, slug, html_content, meta_title, meta_description, status } = body

        if (!title || !slug) {
            return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 })
        }

        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
            return NextResponse.json(
                { error: 'Slug must be lowercase letters, numbers, and hyphens only' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // Check for duplicate slug (exclude current page)
        const { data: existing } = await supabase
            .from('custom_pages')
            .select('id')
            .eq('slug', slug)
            .neq('id', id)
            .maybeSingle()

        if (existing) {
            return NextResponse.json({ error: 'A page with this slug already exists' }, { status: 409 })
        }

        const { data, error } = await supabase
            .from('custom_pages')
            .update({
                title,
                slug,
                html_content: html_content || '',
                meta_title: meta_title || null,
                meta_description: meta_description || null,
                status: status || 'draft',
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ page: data })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to update page'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

// DELETE /api/admin/pages/[id] — Delete page
export async function DELETE(req: NextRequest, { params }: RouteParams) {
    try {
        const auth = await verifyAdmin(req)
        if ('error' in auth) {
            return NextResponse.json({ error: auth.error }, { status: auth.status })
        }

        const { id } = await params
        const supabase = await createClient()

        const { error } = await supabase
            .from('custom_pages')
            .delete()
            .eq('id', id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to delete page'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
