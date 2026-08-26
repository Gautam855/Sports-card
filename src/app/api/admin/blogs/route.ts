import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyAdmin } from '@/lib/api/admin-auth'

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAdmin(req)
        if ('error' in auth) {
            return NextResponse.json({ error: auth.error }, { status: auth.status })
        }

        const supabase = await createClient()

        const [blogsRes, categoriesRes, commentsRes, statsRes] = await Promise.all([
            supabase
                .from('news')
                .select(`
                    id, title, slug, cover_image, status, views, likes,
                    published_at, created_at, updated_at,
                    is_featured, is_editor_pick, is_breaking,
                    author_id, category_id,
                    author:profiles(id, display_name, username, avatar_url),
                    category:news_categories(id, name, slug, color)
                `)
                .order('created_at', { ascending: false }),
            supabase
                .from('news_categories')
                .select('id, name, slug, color')
                .order('name'),
            supabase
                .from('comments')
                .select('content_id')
                .eq('content_type', 'news'),
            supabase
                .from('news')
                .select('id, views, status, likes'),
        ])

        if (blogsRes.error) throw blogsRes.error

        const commentCounts: Record<string, number> = {}
        for (const row of commentsRes.data ?? []) {
            commentCounts[row.content_id] = (commentCounts[row.content_id] ?? 0) + 1
        }

        const blogs = (blogsRes.data ?? []).map((blog) => ({
            ...blog,
            comment_count: commentCounts[blog.id] ?? 0,
        }))

        const authorsMap = new Map<string, { id: string; display_name: string; username: string }>()
        for (const blog of blogs) {
            const raw = blog.author
            const author = (Array.isArray(raw) ? raw[0] : raw) as {
                id: string; display_name?: string; username: string
            } | null | undefined
            if (author?.id) {
                authorsMap.set(author.id, {
                    id: author.id,
                    display_name: author.display_name || author.username,
                    username: author.username,
                })
            }
        }

        const allStats = statsRes.data ?? []
        const stats = {
            total: statsRes.count ?? allStats.length,
            published: allStats.filter((b) => b.status === 'published').length,
            draft: allStats.filter((b) => b.status === 'draft').length,
            archived: allStats.filter((b) => b.status === 'archived').length,
            totalViews: allStats.reduce((sum, b) => sum + (b.views || 0), 0),
            totalLikes: allStats.reduce((sum, b) => sum + (b.likes || 0), 0),
            totalComments: (commentsRes.data ?? []).length,
        }

        return NextResponse.json({
            blogs,
            categories: categoriesRes.data ?? [],
            authors: Array.from(authorsMap.values()).sort((a, b) =>
                a.display_name.localeCompare(b.display_name)
            ),
            stats,
        })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to fetch blogs'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
