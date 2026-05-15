import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { toggleLike } from '@/lib/api/comments'

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization')
        const token = authHeader?.split(' ')[1]
        
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        
        const payload = await verifyToken(token) as any
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

        const { articleId } = await req.json()
        const result = await toggleLike(articleId, payload.id)

        return NextResponse.json({ success: true, ...result })
    } catch (err) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
