import { NextResponse } from 'next/server';
import { getTodayRugby } from '@/lib/api/rapid';

export async function GET() {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    const today = `${y}-${m}-${d}`
    
    try {
        // We need to bypass getTodayRugby to get the raw unmapped response
        const { getActiveKey } = require('@/lib/api/key-manager')
        const key = await getActiveKey('rugby')
        const host = process.env.RUGBY_HOST ?? 'rugby.highlightly.net'
        
        const res = await fetch(`https://${host}/matches?date=${today}`, {
            headers: {
                'X-RapidAPI-Key': key,
                'X-RapidAPI-Host': host
            }
        })
        const status = res.status
        const data = await res.json().catch(() => null)
        
        return NextResponse.json({ success: true, host, status, data });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message });
    }
}
