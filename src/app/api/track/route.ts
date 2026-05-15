import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/** Track a view or click for any content type */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { contentId, contentType = 'news', eventType = 'view' } = body

        if (!contentId) {
            return NextResponse.json({ error: 'contentId required' }, { status: 400 })
        }

        const supabase = await createClient()

        if (eventType === 'view') {
            // Increment view count on the content table
            await supabase.rpc('increment_views', { p_table: contentType === 'news' ? 'news' : 'news', p_id: contentId })
        }

        // Log detailed analytics event
        await supabase.from('analytics_events').insert({
            content_id: contentId,
            content_type: contentType,
            event_type: eventType,
            user_agent: req.headers.get('user-agent') || '',
            referrer: req.headers.get('referer') || '',
            ip_hash: hashIP(req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'),
        })

        return NextResponse.json({ ok: true })
    } catch (err: any) {
        // Don't fail the user experience for analytics
        console.error('[Analytics] Error:', err?.message)
        return NextResponse.json({ ok: true })
    }
}

/** Simple one-way hash so we don't store raw IPs */
function hashIP(ip: string): string {
    let hash = 0
    for (let i = 0; i < ip.length; i++) {
        const char = ip.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32bit
    }
    return Math.abs(hash).toString(36)
}
