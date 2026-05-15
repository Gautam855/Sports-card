import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getComments, addComment } from '@/lib/api/comments'

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const articleId = searchParams.get('articleId')
    if (!articleId) return NextResponse.json([], { status: 400 })

    const comments = await getComments(articleId)
    return NextResponse.json(comments)
}

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization')
        const token = authHeader?.split(' ')[1]
        
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        
        const payload = await verifyToken(token) as any
        if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

        const { articleId, body } = await req.json()
        const comment = await addComment(articleId, payload.id, body)

        return NextResponse.json(comment)
    } catch (err) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
