import { NextRequest, NextResponse } from 'next/server'
import { getPublicClient } from '@/lib/supabase/public'
import { unstable_cache } from 'next/cache'

const getActiveScripts = unstable_cache(
    async () => {
        const supabase = getPublicClient()
        const { data, error } = await supabase
            .from('site_scripts')
            .select('id, slug, script_type, placement, content, src, attributes, pages, exclude_pages, loading_strategy, priority')
            .eq('is_active', true)
            .order('priority', { ascending: true })

        if (error) throw error
        return data ?? []
    },
    ['active-site-scripts'],
    { revalidate: 300, tags: ['site-scripts'] }
)

/**
 * GET /api/site-scripts — Fetch all ACTIVE scripts for frontend injection
 * Public endpoint — cached for 5 minutes (300s) on CDN and in-memory.
 */
export async function GET(req: NextRequest) {
    try {
        const scripts = await getActiveScripts()

        return NextResponse.json(
            { scripts },
            {
                headers: {
                    'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=600',
                },
            }
        )
    } catch {
        return NextResponse.json({ scripts: [] })
    }
}
