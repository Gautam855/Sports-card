import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function getSupabase() {
    const cookieStore = await cookies()
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet: any[]) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        try { cookieStore.set(name, value, options) } catch {}
                    })
                },
            },
        }
    )
}

/**
 * GET /api/merchandise — List merchandise with optional filters
 * ?sport=football&placement=home&active=true&featured=true
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const sport = searchParams.get('sport')
        const placement = searchParams.get('placement')
        const active = searchParams.get('active')
        const featured = searchParams.get('featured')
        const brand = searchParams.get('brand')
        const category = searchParams.get('category')
        const limit = parseInt(searchParams.get('limit') || '50')

        const supabase = await getSupabase()

        let query = supabase
            .from('merchandise')
            .select('*')
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false })
            .limit(limit)

        if (sport && sport !== 'all') query = query.eq('sport', sport)
        if (brand && brand !== 'all') query = query.eq('brand', brand)
        if (category && category !== 'all') query = query.eq('category', category)
        if (active === 'true') query = query.eq('is_active', true)
        if (featured === 'true') query = query.eq('featured', true)
        if (placement) query = query.contains('placements', [placement])

        const { data, error } = await query

        if (error) {
            // Table might not exist yet — return empty
            console.warn('[Merchandise] DB query error:', error.message)
            return NextResponse.json({ items: [], total: 0 })
        }

        return NextResponse.json({ items: data || [], total: data?.length || 0 })
    } catch (err: any) {
        return NextResponse.json({ items: [], total: 0, error: err?.message }, { status: 500 })
    }
}

/**
 * POST /api/merchandise — Create a new merchandise item
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const supabase = await getSupabase()

        const item = {
            name: body.name,
            description: body.description || '',
            sport: body.sport || 'football',
            category: body.category || 'jerseys',
            brand: body.brand || '',
            athlete: body.athlete || '',
            image_url: body.image_url || '',
            price: body.price || 0,
            currency: body.currency || 'USD',
            featured: body.featured || false,
            placements: body.placements || ['merchandise'],
            display_order: body.display_order || 0,
            is_active: body.is_active !== false,
            affiliate_url: body.affiliate_url || '',
            tags: body.tags || [],
        }

        const { data, error } = await supabase
            .from('merchandise')
            .insert(item)
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({ item: data })
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || 'Failed to create' }, { status: 500 })
    }
}

/**
 * PUT /api/merchandise — Update a merchandise item
 */
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const { id, ...updates } = body

        if (!id) {
            return NextResponse.json({ error: 'Missing item id' }, { status: 400 })
        }

        const supabase = await getSupabase()
        const { data, error } = await supabase
            .from('merchandise')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({ item: data })
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || 'Failed to update' }, { status: 500 })
    }
}

/**
 * DELETE /api/merchandise — Delete a merchandise item
 */
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Missing item id' }, { status: 400 })
        }

        const supabase = await getSupabase()
        const { error } = await supabase
            .from('merchandise')
            .delete()
            .eq('id', id)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({ success: true })
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || 'Failed to delete' }, { status: 500 })
    }
}
