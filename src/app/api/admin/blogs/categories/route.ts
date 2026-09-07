import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/api/admin-auth'

/** GET /api/admin/blogs/categories — List all blog categories */
export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAdmin(req)
        if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

        const supabase = await createClient()
        const { data, error } = await supabase
            .from('news_categories')
            .select('id, name, slug, color, description')
            .order('sort_order', { ascending: true })

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json({ categories: data || [] })
    } catch {
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
    }
}
