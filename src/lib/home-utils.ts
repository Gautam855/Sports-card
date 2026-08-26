import { formatDistanceToNow } from 'date-fns'

export function getCategoryName(category: unknown): string {
    if (typeof category === 'object' && category !== null && 'name' in category) {
        return (category as { name: string }).name
    }
    if (typeof category === 'string') return category
    return 'Sports'
}

export function formatArticleDate(item: { date?: string; published_at?: string; created_at?: string }): string {
    const raw = item.published_at || item.created_at || item.date
    if (!raw) return ''
    try {
        return new Date(raw).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
        return item.date || ''
    }
}

export function formatRelativeTime(item: { time?: string; published_at?: string }): string {
    if (item.time) return item.time
    if (item.published_at) {
        try {
            return formatDistanceToNow(new Date(item.published_at), { addSuffix: true })
        } catch {
            return ''
        }
    }
    return ''
}

export function getAuthorName(author: unknown): string {
    if (typeof author === 'object' && author !== null) {
        const a = author as { display_name?: string; username?: string }
        return a.display_name || a.username || 'SportsLNV'
    }
    if (typeof author === 'string') return author
    return 'SportsLNV'
}

export function getAuthorInitial(author: unknown): string {
    return getAuthorName(author).charAt(0).toUpperCase()
}

export function getReadTime(item: { readTime?: string; read_time_mins?: number }): string {
    if (item.readTime) return item.readTime
    if (item.read_time_mins) return `${item.read_time_mins} min read`
    return '5 min read'
}

export function getCoverImage(item: { cover_image?: string; image?: string; image_url?: string; og_image?: string }): string | undefined {
    return item.cover_image || item.image || item.image_url || item.og_image
}
