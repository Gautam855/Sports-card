import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/api/admin-auth'

/**
 * GET /api/admin/site-scripts — List all site scripts
 */
export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAdmin(req)
        if ('error' in auth) {
            return NextResponse.json({ error: auth.error }, { status: auth.status })
        }

        const supabase = await createClient()
        const { data, error } = await supabase
            .from('site_scripts')
            .select('*')
            .order('priority', { ascending: true })
            .order('created_at', { ascending: true })

        if (error) throw error
        return NextResponse.json({ scripts: data })
    } catch (err: any) {
        return NextResponse.json(
            { error: err?.message ?? 'Failed to fetch scripts' },
            { status: 500 }
        )
    }
}

/**
 * POST /api/admin/site-scripts — Create a new script
 */
export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAdmin(req)
        if ('error' in auth) {
            return NextResponse.json({ error: auth.error }, { status: auth.status })
        }

        const body = await req.json()
        const { name, slug, category, script_type, placement, content, src, attributes, pages, exclude_pages, loading_strategy, priority, is_active, notes } = body

        if (!name || !slug) {
            return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
        }

        const supabase = await createClient()
        const { data, error } = await supabase
            .from('site_scripts')
            .insert({
                name,
                slug: slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                category: category || 'custom',
                script_type: script_type || 'script-inline',
                placement: placement || 'head',
                content: content || '',
                src: src || null,
                attributes: attributes || {},
                pages: pages || ['*'],
                exclude_pages: exclude_pages || [],
                loading_strategy: loading_strategy || 'afterInteractive',
                priority: priority ?? 50,
                is_active: is_active ?? false,
                notes: notes || null,
            })
            .select()
            .single()

        if (error) throw error
        return NextResponse.json({ script: data }, { status: 201 })
    } catch (err: any) {
        return NextResponse.json(
            { error: err?.message ?? 'Failed to create script' },
            { status: 500 }
        )
    }
}

/**
 * PUT /api/admin/site-scripts — Update an existing script
 */
export async function PUT(req: NextRequest) {
    try {
        const auth = await verifyAdmin(req)
        if ('error' in auth) {
            return NextResponse.json({ error: auth.error }, { status: auth.status })
        }

        const body = await req.json()
        const { id, ...updates } = body

        if (!id) {
            return NextResponse.json({ error: 'Script ID is required' }, { status: 400 })
        }

        // Sanitize slug if updated
        if (updates.slug) {
            updates.slug = updates.slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        }

        updates.updated_at = new Date().toISOString()

        const supabase = await createClient()
        const { data, error } = await supabase
            .from('site_scripts')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return NextResponse.json({ script: data })
    } catch (err: any) {
        return NextResponse.json(
            { error: err?.message ?? 'Failed to update script' },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/admin/site-scripts — Delete a script
 */
export async function DELETE(req: NextRequest) {
    try {
        const auth = await verifyAdmin(req)
        if ('error' in auth) {
            return NextResponse.json({ error: auth.error }, { status: auth.status })
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Script ID is required' }, { status: 400 })
        }

        const supabase = await createClient()
        const { error } = await supabase
            .from('site_scripts')
            .delete()
            .eq('id', id)

        if (error) throw error
        return NextResponse.json({ success: true })
    } catch (err: any) {
        return NextResponse.json(
            { error: err?.message ?? 'Failed to delete script' },
            { status: 500 }
        )
    }
}
