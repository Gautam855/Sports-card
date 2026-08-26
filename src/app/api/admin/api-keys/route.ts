import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/api/admin-auth'
import {
    getAllProviderStatuses,
    rotateToNextKey,
    setActiveSlot,
    type ProviderName,
} from '@/lib/api/key-manager'

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAdmin(req)
        if ('error' in auth) {
            return NextResponse.json({ error: auth.error }, { status: auth.status })
        }

        const providers = await getAllProviderStatuses()
        return NextResponse.json({ providers })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to fetch API keys'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const auth = await verifyAdmin(req)
        if ('error' in auth) {
            return NextResponse.json({ error: auth.error }, { status: auth.status })
        }

        const body = await req.json()
        const provider = body.provider as ProviderName
        const slot = body.slot as number | undefined
        const action = body.action as string | undefined

        if (!provider || provider !== 'serpapi') {
            return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
        }

        const result =
            action === 'rotate'
                ? await rotateToNextKey(provider)
                : slot
                  ? await setActiveSlot(provider, slot)
                  : { success: false, provider, previousSlot: 0, newSlot: 0, message: 'Missing slot or action' }

        return NextResponse.json(result, { status: result.success ? 200 : 400 })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to update API key'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
