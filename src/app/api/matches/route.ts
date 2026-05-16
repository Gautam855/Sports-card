import { NextRequest, NextResponse } from 'next/server'
import { 
    getAllTodayMatches, 
    getTodayFootball, getTodayBasketball, getUpcomingTennis,
    getLiveCricket, getRecentCricket, getUpcomingCricket,
    getLiveRugby, getTodayRugby, getRecentRugby
} from '@/lib/api/rapid'

export const revalidate = 60

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl
    const sport = searchParams.get('sport')
    const type = searchParams.get('type') ?? 'today'

    try {
        let matches: any[] = []

        if (sport === 'football') {
            matches = await getTodayFootball()
        } else if (sport === 'basketball') {
            matches = await getTodayBasketball()
        } else if (sport === 'tennis') {
            matches = await getUpcomingTennis()
        } else if (sport === 'cricket') {
            if (type === 'live') matches = await getLiveCricket()
            else if (type === 'recent') matches = await getRecentCricket()
            else if (type === 'upcoming') matches = await getUpcomingCricket()
            else matches = await getLiveCricket()
        } else if (sport === 'rugby') {
            if (type === 'live') matches = await getLiveRugby()
            else if (type === 'recent') matches = await getRecentRugby()
            else if (type === 'upcoming') matches = await getTodayRugby()
            else matches = await getTodayRugby()
        } else {
            matches = await getAllTodayMatches()
        }

        return NextResponse.json({ matches, updated_at: new Date().toISOString() })
    } catch {
        return NextResponse.json({ matches: [], updated_at: new Date().toISOString() }, { status: 500 })
    }
}
