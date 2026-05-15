'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BlogEditorClient } from '@/components/admin/BlogEditorClient'
import { Loader2 } from 'lucide-react'

export default function NewBlogPage() {
    const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const supabase = createClient()
        supabase.from('news_categories').select('id, name').order('name')
            .then(({ data }) => {
                setCategories(data ?? [])
                setLoading(false)
            })
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <BlogEditorClient categories={categories} />
        </div>
    )
}
