import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/api/admin-auth'

interface RouteParams { params: Promise<{ id: string }> }

/** PUT — Update a player */
export async function PUT(req: NextRequest, { params }: RouteParams) {
    try {
        const auth = await verifyAdmin(req)
        if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

        const { id } = await params
        const body = await req.json()
        const updates: Record<string, any> = {}

        if (body.player_name !== undefined) updates.player_name = body.player_name.trim()
        if (body.player_image !== undefined) updates.player_image = body.player_image?.trim() || null
        if (body.player_url !== undefined) updates.player_url = body.player_url?.trim() || null
        if (body.category_id !== undefined) updates.category_id = body.category_id
        if (body.sort_order !== undefined) updates.sort_order = body.sort_order

        const supabase = await createClient()
        const { data, error } = await supabase
            .from('category_players')
            .update(updates)
            .eq('id', id)
            .select('*, category:news_categories(id, name, slug, color)')
            .single()

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json({ player: data })
    } catch {
        return NextResponse.json({ error: 'Failed to update player' }, { status: 500 })
    }
}

/** DELETE — Remove a player */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
    try {
        const auth = await verifyAdmin(req)
        if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

        const { id } = await params
        const supabase = await createClient()
        const { error } = await supabase.from('category_players').delete().eq('id', id)

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ error: 'Failed to delete player' }, { status: 500 })
    }
}
