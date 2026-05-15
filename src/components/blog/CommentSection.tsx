'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { Loader2, MessageSquare } from 'lucide-react'

interface Comment {
    id: string
    body: string
    created_at: string
    user: {
        username: string
        display_name: string
        avatar_url: string
    }
}

export function CommentSection({ articleId }: { articleId: string }) {
    const { user } = useAuth()
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        fetch(`/api/blog/comments?articleId=${articleId}`)
            .then(res => res.json())
            .then(data => {
                setComments(data)
                setLoading(false)
            })
    }, [articleId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) {
            toast.error('Please login to comment')
            return
        }
        if (!newComment.trim()) return

        setSubmitting(true)
        try {
            const token = localStorage.getItem('sp_auth_token')
            const res = await fetch('/api/blog/comments', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ articleId, body: newComment })
            })
            const data = await res.json()
            if (data.id) {
                // Prepend new comment with user data
                const freshComment = {
                    ...data,
                    user: {
                        username: user.username,
                        display_name: user.display_name || user.username,
                        avatar_url: user.avatar_url || ''
                    }
                }
                setComments([freshComment, ...comments])
                setNewComment('')
                toast.success('Comment posted!')
            }
        } catch (err) {
            toast.error('Failed to post comment')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="mt-12 space-y-8">
            <h3 className="text-xl font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Comments ({comments.length})
            </h3>

            {user ? (
                <form onSubmit={handleSubmit} className="space-y-4 bg-muted/30 p-4 rounded-xl">
                    <Textarea 
                        placeholder="Join the discussion..." 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[100px] bg-background"
                    />
                    <div className="flex justify-end">
                        <Button disabled={submitting || !newComment.trim()}>
                            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Post Comment
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="bg-muted/30 p-6 rounded-xl text-center">
                    <p className="text-muted-foreground mb-4">You must be logged in to comment.</p>
                    <Button variant="outline" asChild>
                        <a href={`/login?redirect=/blog/${articleId}`}>Sign In</a>
                    </Button>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-6">
                    {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4">
                            <Avatar className="w-10 h-10 border border-border">
                                <AvatarImage src={comment.user?.avatar_url || ''} />
                                <AvatarFallback>{(comment.user?.username || 'U')[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm">{comment.user?.display_name || comment.user?.username || 'Anonymous'}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-sm leading-relaxed text-foreground/90">{comment.body}</p>
                            </div>
                        </div>
                    ))}
                    {comments.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">No comments yet. Be the first!</p>
                    )}
                </div>
            )}
        </div>
    )
}
