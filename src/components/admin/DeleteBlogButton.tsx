'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Props {
    id: string
    title: string
    onDeleted?: () => void
}

export function DeleteBlogButton({ id, title, onDeleted }: Props) {
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()

    async function handleDelete() {
        if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return

        setIsDeleting(true)
        try {
            const supabase = createClient()
            const { error } = await supabase.from('news').delete().eq('id', id)

            if (error) {
                toast.error(error.message)
            } else {
                toast.success('Blog deleted successfully')
                onDeleted?.()
                router.refresh()
            }
        } catch (err: any) {
            toast.error('Failed to delete blog')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
            title="Delete Blog"
        >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
    )
}
