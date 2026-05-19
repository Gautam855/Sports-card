import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/site-scripts — Fetch all ACTIVE scripts for frontend injection
 * Public endpoint — no auth needed. Cached for 60s.
 */
export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('site_scripts')
            .select('id, slug, script_type, placement, content, src, attributes, pages, exclude_pages, loading_strategy, priority')
            .eq('is_active', true)
            .order('priority', { ascending: true })

        if (error) throw error

        return NextResponse.json(
            { scripts: data ?? [] },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
                },
            }
        )
    } catch (err: any) {
        // Return empty scripts on error — don't break the site
        return NextResponse.json({ scripts: [] })
    }
}
