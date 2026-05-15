'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BlogEditorClient } from '@/components/admin/BlogEditorClient'
import { Loader2 } from 'lucide-react'

export default function EditBlogPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const [article, setArticle] = useState<any>(null)
    const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const supabase = createClient()

        Promise.all([
            supabase.from('news').select('*').eq('id', id).single(),
            supabase.from('news_categories').select('id, name').order('name'),
        ]).then(([articleRes, categoriesRes]) => {
            if (articleRes.error || !articleRes.data) {
                router.push('/admin/blogs')
                return
            }
            setArticle(articleRes.data)
            setCategories(categoriesRes.data ?? [])
            setLoading(false)
        })
    }, [id, router])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <BlogEditorClient
                article={{
                    id: article.id,
                    title: article.title,
                    slug: article.slug,
                    excerpt: article.excerpt || '',
                    content: article.content || '',
                    cover_image: article.cover_image || '',
                    cover_alt: article.cover_alt || '',
                    meta_title: article.meta_title || '',
                    meta_description: article.meta_description || '',
                    canonical_url: article.canonical_url || '',
                    is_breaking: article.is_breaking || false,
                    is_featured: article.is_featured || false,
                    is_editor_pick: article.is_editor_pick || false,
                    status: article.status || 'draft',
                    read_time_mins: article.read_time_mins || undefined,
                }}
                categories={categories}
                categoryId={article.category_id || ''}
            />
        </div>
    )
}
