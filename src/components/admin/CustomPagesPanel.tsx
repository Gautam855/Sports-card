'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
    FileText, Plus, Eye, Calendar, Edit, Search,
    Loader2, Trash2, Globe, ExternalLink,
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { useAuth } from '@/components/providers/AuthProvider'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface CustomPage {
    id: string
    title: string
    slug: string
    status: string
    meta_title?: string
    meta_description?: string
    created_by?: string
    created_at: string
    updated_at: string
}

interface PageStats {
    total: number
    published: number
    draft: number
}

const ITEMS_PER_PAGE = 10

export function CustomPagesPanel() {
    const { getToken } = useAuth()
    const [pages, setPages] = useState<CustomPage[]>([])
    const [stats, setStats] = useState<PageStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const fetchPages = useCallback(async () => {
        try {
            const token = getToken()
            const res = await fetch('/api/admin/pages', {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) throw new Error('Failed to fetch pages')
            const data = await res.json()
            setPages(data.pages)
            setStats(data.stats)
        } catch {
            toast.error('Failed to load pages')
        } finally {
            setLoading(false)
        }
    }, [getToken])

    useEffect(() => {
        fetchPages()
    }, [fetchPages])

    const filteredPages = useMemo(() => {
        let result = pages
        if (search) {
            const q = search.toLowerCase()
            result = result.filter(p =>
                p.title.toLowerCase().includes(q) ||
                p.slug.toLowerCase().includes(q)
            )
        }
        if (statusFilter !== 'all') {
            result = result.filter(p => p.status === statusFilter)
        }
        return result
    }, [pages, search, statusFilter])

    const totalPages = Math.ceil(filteredPages.length / ITEMS_PER_PAGE)
    const paginatedPages = filteredPages.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    async function handleDelete(id: string, title: string) {
        if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return
        setDeletingId(id)
        try {
            const token = getToken()
            const res = await fetch(`/api/admin/pages/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) throw new Error('Failed to delete')
            toast.success('Page deleted')
            fetchPages()
        } catch {
            toast.error('Failed to delete page')
        } finally {
            setDeletingId(null)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading pages...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-display flex items-center gap-2">
                        <FileText className="w-6 h-6 text-primary" />
                        Custom Pages
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Create and manage custom landing pages
                    </p>
                </div>
                <Link
                    href="/admin/pages/new"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
                >
                    <Plus className="w-4 h-4" />
                    Add New Page
                </Link>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: 'Total Pages', value: stats.total, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                        { label: 'Published', value: stats.published, icon: Globe, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                        { label: 'Drafts', value: stats.draft, icon: Edit, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                    ].map(card => (
                        <div key={card.label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
                            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', card.bg)}>
                                <card.icon className={cn('w-5 h-5', card.color)} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{card.value}</p>
                                <p className="text-xs text-muted-foreground">{card.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search pages by title or slug..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
                        className="pl-9"
                    />
                </div>
                <div className="flex gap-2">
                    {(['all', 'published', 'draft'] as const).map(s => (
                        <button
                            key={s}
                            onClick={() => { setStatusFilter(s); setCurrentPage(1) }}
                            className={cn(
                                'px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
                                statusFilter === s
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:bg-accent'
                            )}
                        >
                            {s === 'all' ? 'All' : s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Pages Table */}
            {filteredPages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-dashed border-border bg-card/50">
                    <FileText className="w-12 h-12 text-muted-foreground/30 mb-4" />
                    <h3 className="font-semibold text-lg">No pages found</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">
                        {search ? 'Try a different search term' : 'Create your first custom landing page'}
                    </p>
                    {!search && (
                        <Link
                            href="/admin/pages/new"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Create Page
                        </Link>
                    )}
                </div>
            ) : (
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-muted/30">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Page</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Slug</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Created</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedPages.map((page, i) => (
                                    <tr
                                        key={page.id}
                                        className={cn(
                                            'border-b border-border/50 hover:bg-accent/30 transition-colors',
                                            i === paginatedPages.length - 1 && 'border-b-0'
                                        )}
                                    >
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/admin/pages/${page.id}`}
                                                className="font-semibold text-sm hover:text-primary transition-colors line-clamp-1"
                                            >
                                                {page.title}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <code className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground">
                                                /p/{page.slug}
                                            </code>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={cn(
                                                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
                                                    page.status === 'published'
                                                        ? 'bg-emerald-500/10 text-emerald-600'
                                                        : 'bg-amber-500/10 text-amber-600'
                                                )}
                                            >
                                                <span className={cn(
                                                    'w-1.5 h-1.5 rounded-full',
                                                    page.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'
                                                )} />
                                                {page.status === 'published' ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {formatDate(page.created_at)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                {page.status === 'published' && (
                                                    <Link
                                                        href={`/p/${page.slug}`}
                                                        target="_blank"
                                                        className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                                        title="View live page"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </Link>
                                                )}
                                                <Link
                                                    href={`/admin/pages/${page.id}`}
                                                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                                    title="Edit page"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(page.id, page.title)}
                                                    disabled={deletingId === page.id}
                                                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                                                    title="Delete page"
                                                >
                                                    {deletingId === page.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
                            <p className="text-xs text-muted-foreground">
                                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredPages.length)} of {filteredPages.length}
                            </p>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-1.5 rounded-lg hover:bg-accent disabled:opacity-30 transition-colors">
                                    <ChevronsLeft className="w-4 h-4" />
                                </button>
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg hover:bg-accent disabled:opacity-30 transition-colors">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="px-3 py-1 text-sm font-medium">{currentPage} / {totalPages}</span>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded-lg hover:bg-accent disabled:opacity-30 transition-colors">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                                <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-1.5 rounded-lg hover:bg-accent disabled:opacity-30 transition-colors">
                                    <ChevronsRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
