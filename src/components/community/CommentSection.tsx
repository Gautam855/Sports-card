'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { User, Send, ThumbsUp, MoreVertical, Reply, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { Comment, Profile } from '@/lib/types'
import { toast } from 'sonner'

interface CommentSectionProps {
    contentId: string
    contentType: 'news'
}

export function CommentSection({ contentId, contentType }: CommentSectionProps) {
    const supabase = createClient()
    const [comments, setComments] = useState<Comment[]>([])
    const [user, setUser] = useState<Profile | null>(null)
    const [body, setBody] = useState('')
    const [replyTo, setReplyTo] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        async function init() {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (authUser) {
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single()
                setUser(profile)
            }

            const { data } = await supabase
                .from('comments')
                .select('*, user:profiles(id,username,display_name,avatar_url)')
                .eq('content_id', contentId)
                .eq('content_type', contentType)
                .is('parent_id', null)
                .eq('is_hidden', false)
                .order('created_at', { ascending: false })
                .limit(50)

            setComments((data ?? []) as unknown as Comment[])
            setLoading(false)
        }
        init()

        // Realtime subscription
        const channel = supabase
            .channel(`comments-${contentId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'comments',
                filter: `content_id=eq.${contentId}`,
            }, async (payload) => {
                const { data: newComment } = await supabase
                    .from('comments')
                    .select('*, user:profiles(id,username,display_name,avatar_url)')
                    .eq('id', payload.new.id)
                    .single()
                if (newComment) {
                    setComments(prev => [newComment as unknown as Comment, ...prev])
                }
            })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [contentId, contentType])

    async function handleSubmit() {
        if (!user) {
            toast.error('Please sign in to comment')
            return
        }
        if (!body.trim()) return

        setSubmitting(true)
        const { error } = await supabase.from('comments').insert({
            user_id: user.id,
            content_id: contentId,
            content_type: contentType,
            parent_id: replyTo,
            body: body.trim(),
        })

        if (error) {
            toast.error('Failed to post comment')
        } else {
            setBody('')
            setReplyTo(null)
            toast.success('Comment posted!')
        }
        setSubmitting(false)
    }

    async function handleLike(commentId: string) {
        if (!user) { toast.error('Sign in to like'); return }
        await supabase.from('reactions').upsert({
            user_id: user.id,
            content_id: commentId,
            content_type: 'comment',
        })
        setComments(prev => prev.map(c => c.id === commentId ? { ...c, likes: (c.likes ?? 0) + 1 } : c))
    }

    return (
        <div>
            <div className="flex items-center gap-2 mb-6">
                <MessageSquare className="w-5 h-5" />
                <h2 className="font-display font-bold text-xl">
                    Comments <span className="text-muted-foreground font-normal text-base">({comments.length})</span>
                </h2>
            </div>

            {/* Comment input */}
            <div className="score-card p-4 mb-6">
                {user ? (
                    <div className="flex gap-3">
                        {user.avatar_url ? (
                            <Image src={user.avatar_url} alt={user.username} width={36} height={36} className="rounded-full flex-shrink-0" />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-muted flex-shrink-0 flex items-center justify-center">
                                <User className="w-4 h-4 text-muted-foreground" />
                            </div>
                        )}
                        <div className="flex-1 space-y-2">
                            {replyTo && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Reply className="w-3 h-3" />
                                    <span>Replying to a comment</span>
                                    <button onClick={() => setReplyTo(null)} className="text-primary hover:underline">Cancel</button>
                                </div>
                            )}
                            <Textarea
                                placeholder="Add a comment..."
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                className="min-h-[80px] resize-none"
                                onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) handleSubmit() }}
                            />
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Ctrl+Enter to submit</span>
                                <Button size="sm" onClick={handleSubmit} disabled={submitting || !body.trim()}>
                                    <Send className="w-3.5 h-3.5 mr-1.5" />
                                    {submitting ? 'Posting...' : 'Post'}
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">Sign in to join the conversation</span>
                        <Button asChild size="sm">
                            <a href="/login">Sign In</a>
                        </Button>
                    </div>
                )}
            </div>

            {/* Comments list */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <CommentSkeleton key={i} />)}
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No comments yet. Be the first to comment!</p>
                </div>
            ) : (
                <AnimatePresence>
                    <div className="space-y-3">
                        {comments.map((comment, i) => (
                            <motion.div
                                key={comment.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                            >
                                <CommentItem
                                    comment={comment}
                                    onLike={handleLike}
                                    onReply={(id) => setReplyTo(id)}
                                    currentUserId={user?.id}
                                />
                            </motion.div>
                        ))}
                    </div>
                </AnimatePresence>
            )}
        </div>
    )
}

function CommentItem({ comment, onLike, onReply, currentUserId }: {
    comment: Comment
    onLike: (id: string) => void
    onReply: (id: string) => void
    currentUserId?: string
}) {
    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 60) return `${mins}m ago`
        const hours = Math.floor(mins / 60)
        if (hours < 24) return `${hours}h ago`
        return `${Math.floor(hours / 24)}d ago`
    }

    return (
        <div className="flex gap-3 group">
            {comment.user?.avatar_url ? (
                <Image src={comment.user.avatar_url} alt={comment.user.username} width={32} height={32} className="rounded-full flex-shrink-0 mt-0.5" />
            ) : (
                <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0 mt-0.5 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold">{comment.user?.display_name ?? comment.user?.username}</span>
                    <span className="text-xs text-muted-foreground">{timeAgo(comment.created_at)}</span>
                    {comment.is_pinned && (
                        <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">Pinned</span>
                    )}
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">{comment.content}</p>
                <div className="flex items-center gap-3 mt-2">
                    <button
                        onClick={() => onLike(comment.id)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        {(comment.likes ?? 0) > 0 && <span>{comment.likes}</span>}
                    </button>
                    <button
                        onClick={() => onReply(comment.id)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                        <Reply className="w-3.5 h-3.5" />
                        Reply
                    </button>
                </div>
            </div>
        </div>
    )
}

function CommentSkeleton() {
    return (
        <div className="flex gap-3">
            <div className="skeleton w-8 h-8 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="skeleton h-3 w-32 rounded" />
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-3/4 rounded" />
            </div>
        </div>
    )
}