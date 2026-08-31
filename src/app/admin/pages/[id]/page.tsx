'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { PageEditorClient } from '@/components/admin/PageEditorClient'
import { Loader2 } from 'lucide-react'

export default function EditPagePage() {
    const params = useParams()
    const router = useRouter()
    const { getToken } = useAuth()
    const id = params.id as string

    const [page, setPage] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchPage() {
            try {
                const token = getToken()
                const res = await fetch(`/api/admin/pages/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                if (!res.ok) {
                    router.push('/admin/pages')
                    return
                }
                const data = await res.json()
                setPage(data.page)
            } catch {
                router.push('/admin/pages')
            } finally {
                setLoading(false)
            }
        }
        fetchPage()
    }, [id, router, getToken])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!page) return null

    return (
        <PageEditorClient
            page={{
                id: page.id,
                title: page.title,
                slug: page.slug,
                html_content: page.html_content || '',
                meta_title: page.meta_title || '',
                meta_description: page.meta_description || '',
                status: page.status || 'draft',
            }}
        />
    )
}
