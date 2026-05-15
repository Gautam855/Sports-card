'use client'

import { useState, useEffect } from 'react'
import { Heart, MessageSquare, Share2 } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface InteractionProps {
    articleId: string
    initialLikes: number
    commentCount: number
}

export function BlogInteraction({ articleId, initialLikes, commentCount }: InteractionProps) {
    const { user } = useAuth()
    const [likes, setLikes] = useState(initialLikes)
    const [isLiked, setIsLiked] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (user) {
            const supabase = createClient()
            supabase
                .from('reactions')
                .select('id')
                .eq('content_id', articleId)
                .eq('user_id', user.id)
                .single()
                .then(({ data }) => setIsLiked(!!data))
        }
    }, [user, articleId])

    const handleLike = async () => {
        if (!user) {
            toast.error('Please login to like this post')
            return
        }

        setLoading(true)
        try {
            const token = localStorage.getItem('sp_auth_token')
            const res = await fetch('/api/blog/like', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ articleId })
            })
            
            const data = await res.json()
            if (data.success) {
                setIsLiked(data.liked)
                setLikes(prev => data.liked ? prev + 1 : prev - 1)
            }
        } catch (err) {
            toast.error('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center gap-6 py-6 border-y border-border/60">
            <button 
                onClick={handleLike}
                disabled={loading}
                className={cn(
                    "flex items-center gap-2 transition-colors",
                    isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                )}
            >
                <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
                <span className="text-sm font-medium">{likes}</span>
            </button>

            <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <MessageSquare className="w-5 h-5" />
                <span className="text-sm font-medium">{commentCount}</span>
            </button>

            <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors ml-auto">
                <Share2 className="w-5 h-5" />
                <span className="text-sm font-medium">Share</span>
            </button>
        </div>
    )
}
