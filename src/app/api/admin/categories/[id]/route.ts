import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/api/admin-auth'

interface RouteParams { params: Promise<{ id: string }> }

/** GET /api/admin/categories/[id] — Get single category with players */
export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const auth = await verifyAdmin(req)
        if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

        const { id } = await params
        const supabase = await createClient()

        const { data: category, error } = await supabase
            .from('news_categories')
            .select('*')
            .eq('id', id)
            .single()

        if (error || !category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 })
        }

        // Fetch linked players
        const { data: players } = await supabase
            .from('category_players')
            .select('id, player_name, player_image, player_url, sort_order')
            .eq('category_id', id)
            .order('sort_order', { ascending: true })

        return NextResponse.json({
            category: {
                ...category,
                players: players || [],
            },
        })
    } catch {
        return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 })
    }
}

/** PUT /api/admin/categories/[id] — Update category */
export async function PUT(req: NextRequest, { params }: RouteParams) {
    try {
        const auth = await verifyAdmin(req)
        if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

        const { id } = await params
        const body = await req.json()
        const { name, slug, color, emoji, description, meta_title, meta_description, faqs, sort_order } = body

        const supabase = await createClient()

        // Check slug uniqueness (excluding current)
        if (slug) {
            const { data: existing } = await supabase
                .from('news_categories')
                .select('id')
                .eq('slug', slug)
                .neq('id', id)
                .maybeSingle()

            if (existing) {
                return NextResponse.json({ error: 'A category with this slug already exists' }, { status: 409 })
            }
        }

        const updateData: Record<string, unknown> = {}
        if (name !== undefined) updateData.name = name.trim()
        if (slug !== undefined) updateData.slug = slug.trim()
        if (color !== undefined) updateData.color = color
        if (emoji !== undefined) updateData.emoji = emoji || null
        if (description !== undefined) updateData.description = description?.trim() || null
        if (meta_title !== undefined) updateData.meta_title = meta_title?.trim() || null
        if (meta_description !== undefined) updateData.meta_description = meta_description?.trim() || null
        if (faqs !== undefined) updateData.faqs = faqs
        if (sort_order !== undefined) updateData.sort_order = sort_order

        const { data, error } = await supabase
            .from('news_categories')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json({ category: data })
    } catch {
        return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
    }
}

/** DELETE /api/admin/categories/[id] — Delete category */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
    try {
        const auth = await verifyAdmin(req)
        if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

        const { id } = await params
        const supabase = await createClient()

        const { error } = await supabase
            .from('news_categories')
            .delete()
            .eq('id', id)

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
    }
}
