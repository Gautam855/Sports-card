import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAllProviderStatuses, setActiveSlot, rotateToNextKey, type ProviderName } from '@/lib/api/key-manager'

const VALID_PROVIDERS = ['football536', 'basketball', 'baseball', 'boxing', 'tennis', 'cricket', 'rugby']

/**
 * GET /api/admin/api-keys — List all provider key statuses
 */
export async function GET() {
    try {
        const supabase = await createClient()
        
        // Check authorization
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', authUser.id)
            .single()

        if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin' && profile.role !== 'editor')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const statuses = await getAllProviderStatuses()
        return NextResponse.json({ providers: statuses })
    } catch (err: any) {
        return NextResponse.json(
            { error: err?.message ?? 'Failed to fetch key statuses' },
            { status: 500 }
        )
    }
}

/**
 * POST /api/admin/api-keys
 * 
 * Switch to specific slot:  { provider: 'football', slot: 2 }
 * Rotate to next key:       { provider: 'football', action: 'rotate' }
 */
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()
        
        // Check authorization
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', authUser.id)
            .single()

        if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin' && profile.role !== 'editor')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await req.json()
        const { provider, slot, action } = body

        if (!provider) {
            return NextResponse.json(
                { error: 'Missing required field: provider' },
                { status: 400 }
            )
        }

        if (!VALID_PROVIDERS.includes(provider)) {
            return NextResponse.json(
                { error: `Invalid provider: ${provider}` },
                { status: 400 }
            )
        }

        // ── Rotate to next key ──
        if (action === 'rotate') {
            const result = await rotateToNextKey(provider as ProviderName)
            return NextResponse.json(result)
        }

        // ── Switch to specific slot ──
        if (!slot || slot < 1 || slot > 5) {
            return NextResponse.json(
                { error: 'Slot must be between 1 and 5' },
                { status: 400 }
            )
        }

        const result = await setActiveSlot(provider as ProviderName, slot)
        return NextResponse.json(result)
    } catch (err: any) {
        return NextResponse.json(
            { error: err?.message ?? 'Failed to switch key slot' },
            { status: 500 }
        )
    }
}
