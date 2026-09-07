import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/api/admin-auth'

/**
 * GET /api/admin/category-players — List all players (optionally filtered by category_id)
 * POST /api/admin/category-players — Add a player to a category
 */
export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAdmin(req)
        if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

        const supabase = await createClient()
        const categoryId = req.nextUrl.searchParams.get('category_id')

        let query = supabase
            .from('category_players')
            .select('*, category:news_categories(id, name, slug, color)')
            .order('sort_order', { ascending: true })

        if (categoryId) {
            query = query.eq('category_id', categoryId)
        }

        const { data, error } = await query
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json({ players: data || [] })
    } catch (err: unknown) {
        return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAdmin(req)
        if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

        const body = await req.json()
        const { category_id, player_name, player_image, player_url, sort_order } = body

        if (!category_id || !player_name) {
            return NextResponse.json({ error: 'category_id and player_name are required' }, { status: 400 })
        }

        const supabase = await createClient()
        const { data, error } = await supabase
            .from('category_players')
            .insert({
                category_id,
                player_name: player_name.trim(),
                player_image: player_image?.trim() || null,
                player_url: player_url?.trim() || null,
                sort_order: sort_order || 0,
            })
            .select('*, category:news_categories(id, name, slug, color)')
            .single()

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json({ player: data }, { status: 201 })
    } catch (err: unknown) {
        return NextResponse.json({ error: 'Failed to create player' }, { status: 500 })
    }
}
