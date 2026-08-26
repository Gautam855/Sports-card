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

export function formatArticleDateUpper(item: { date?: string; published_at?: string; created_at?: string }): string {
    const raw = item.published_at || item.created_at || item.date
    if (!raw) return ''
    try {
        return new Date(raw)
            .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            .toUpperCase()
    } catch {
        return (item.date || '').toUpperCase()
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

export function getReadTimeShort(item: { readTime?: string; read_time_mins?: number }): string {
    if (item.read_time_mins) return `${item.read_time_mins} MIN`
    if (item.readTime) {
        const match = item.readTime.match(/(\d+)/)
        return match ? `${match[1]} MIN` : '5 MIN'
    }
    return '5 MIN'
}

export function isRealTimeNews(item: { id?: string; category?: unknown }): boolean {
    if (item.id?.startsWith('serp-')) return true
    if (typeof item.category === 'object' && item.category !== null && 'slug' in item.category) {
        return (item.category as { slug: string }).slug === 'real-time'
    }
    return false
}

export function getCoverImage(item: { cover_image?: string; image?: string; image_url?: string; og_image?: string }): string | undefined {
    return item.cover_image || item.image || item.image_url || item.og_image
}

export function getCategoryColor(category: unknown): string {
    if (typeof category === 'object' && category !== null && 'color' in category) {
        const color = (category as { color?: string }).color
        if (color) return color
    }
    return '#dc2626'
}

export function getAuthorAvatar(author: unknown): string | undefined {
    if (typeof author === 'object' && author !== null && 'avatar_url' in author) {
        const url = (author as { avatar_url?: string }).avatar_url
        return url || undefined
    }
    return undefined
}
