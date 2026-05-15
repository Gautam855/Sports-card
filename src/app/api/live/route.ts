import { NextResponse } from 'next/server'
import { getAllLiveMatches } from '@/lib/api/rapid'

export const revalidate = 30 // ISR every 30s

export async function GET() {
    try {
        const matches = await getAllLiveMatches()
        return NextResponse.json({ matches, updated_at: new Date().toISOString() })
    } catch {
        return NextResponse.json({ matches: [], updated_at: new Date().toISOString() }, { status: 500 })
    }
}
