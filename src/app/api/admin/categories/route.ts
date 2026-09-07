import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/api/admin-auth'

/**
 * GET /api/admin/categories — List all categories with player count
 * POST /api/admin/categories — Create a new category
 */
export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAdmin(req)
        if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

        const supabase = await createClient()

        // Fetch categories
        const { data: categories, error } = await supabase
            .from('news_categories')
            .select('*')
            .order('sort_order', { ascending: true })

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        // Fetch player counts per category
        const { data: playerCounts } = await supabase
            .from('category_players')
            .select('category_id')

        const countMap: Record<string, number> = {}
        if (playerCounts) {
            for (const p of playerCounts) {
                countMap[p.category_id] = (countMap[p.category_id] || 0) + 1
            }
        }

        const enriched = (categories || []).map(cat => ({
            ...cat,
            player_count: countMap[cat.id] || 0,
            faq_count: Array.isArray(cat.faqs) ? cat.faqs.length : 0,
        }))

        return NextResponse.json({ categories: enriched })
    } catch {
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAdmin(req)
        if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

        const body = await req.json()
        const { name, slug, color, emoji, description, meta_title, meta_description, faqs, sort_order } = body

        if (!name || !slug) {
            return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
        }

        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
            return NextResponse.json({ error: 'Slug must be lowercase letters, numbers, and hyphens only' }, { status: 400 })
        }

        const supabase = await createClient()

        // Check slug uniqueness
        const { data: existing } = await supabase
            .from('news_categories')
            .select('id')
            .eq('slug', slug)
            .maybeSingle()

        if (existing) {
            return NextResponse.json({ error: 'A category with this slug already exists' }, { status: 409 })
        }

        const { data, error } = await supabase
            .from('news_categories')
            .insert({
                name: name.trim(),
                slug: slug.trim(),
                color: color || '#6366f1',
                emoji: emoji || null,
                description: description?.trim() || null,
                meta_title: meta_title?.trim() || null,
                meta_description: meta_description?.trim() || null,
                faqs: faqs || [],
                sort_order: sort_order || 99,
            })
            .select()
            .single()

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json({ category: data }, { status: 201 })
    } catch {
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
    }
}
