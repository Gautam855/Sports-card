import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/api/admin-auth'
import { getAllAPIStatuses } from '@/lib/api/api-status'

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAdmin(req)
        if ('error' in auth) {
            return NextResponse.json({ error: auth.error }, { status: auth.status })
        }

        const statuses = await getAllAPIStatuses()
        return NextResponse.json({ statuses })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to check API status'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
