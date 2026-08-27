'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
    PenTool, Plus, Eye, Calendar, Edit, FileText, Search, Filter,
    Loader2, MessageSquare, Heart, Star, Trophy, Zap, ArrowUpDown, User,
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import { useAuth } from '@/components/providers/AuthProvider'
import { DeleteBlogButton } from '@/components/admin/DeleteBlogButton'
import { Input } from '@/components/ui/input'

interface BlogAuthor {
    id: string
    display_name?: string
    username: string
    avatar_url?: string
}

interface BlogCategory {
    id: string
    name: string
    slug: string
    color?: string
}

interface BlogRow {
    id: string
    title: string
    slug: string
    cover_image?: string
    status: string
    views: number
    likes: number
    comment_count: number
    published_at?: string
    created_at: string
    is_featured?: boolean
    is_editor_pick?: boolean
    is_breaking?: boolean
    author_id?: string
    category_id?: string
    author?: BlogAuthor | null
    category?: BlogCategory | null
}

interface BlogStats {
    total: number
    published: number
    draft: number
    archived: number
    totalViews: number
    totalLikes: number
    totalComments: number
}

type SortOption = 'recent' | 'oldest' | 'top_views' | 'top_likes' | 'top_comments' | 'title_asc' | 'title_desc'
type TriFilter = 'all' | 'yes' | 'no'
type DateFilter = 'all' | '7d' | '30d' | '90d'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'top_views', label: 'Top Views' },
    { value: 'top_likes', label: 'Top Likes' },
    { value: 'top_comments', label: 'Most Comments' },
    { value: 'title_asc', label: 'Title A → Z' },
    { value: 'title_desc', label: 'Title Z → A' },
]

export function AdminBlogsPanel() {
    const { getToken } = useAuth()
    const [blogs, setBlogs] = useState<BlogRow[]>([])
    const [categories, setCategories] = useState<BlogCategory[]>([])
    const [authors, setAuthors] = useState<{ id: string; display_name: string; username: string }[]>([])
    const [stats, setStats] = useState<BlogStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [search, setSearch] = useState('')
    const [sort, setSort] = useState<SortOption>('recent')
    const [statusFilter, setStatusFilter] = useState('all')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [authorFilter, setAuthorFilter] = useState('all')
    const [featuredFilter, setFeaturedFilter] = useState<TriFilter>('all')
    const [editorPickFilter, setEditorPickFilter] = useState<TriFilter>('all')
    const [breakingFilter, setBreakingFilter] = useState<TriFilter>('all')
    const [dateFilter, setDateFilter] = useState<DateFilter>('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(15)

    const fetchBlogs = useCallback(async () => {
        try {
            setLoading(true)
            const token = getToken()
            const headers: Record<string, string> = {}
            if (token) headers['Authorization'] = `Bearer ${token}`

            const res = await fetch('/api/admin/blogs', { headers })
            const data = await res.json()

            if (data.error) {
                setError(data.error)
            } else {
                setBlogs(data.blogs ?? [])
                setCategories(data.categories ?? [])
                setAuthors(data.authors ?? [])
                setStats(data.stats ?? null)
                setError(null)
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to load blogs')
        } finally {
            setLoading(false)
        }
    }, [getToken])

    useEffect(() => {
        fetchBlogs()
    }, [fetchBlogs])

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        const now = Date.now()

        const matchesTri = (val: boolean | undefined, filter: TriFilter) => {
            if (filter === 'all') return true
            return filter === 'yes' ? !!val : !val
        }

        const matchesDate = (blog: BlogRow) => {
            if (dateFilter === 'all') return true
            const days = dateFilter === '7d' ? 7 : dateFilter === '30d' ? 30 : 90
            const ref = blog.published_at || blog.created_at
            return now - new Date(ref).getTime() <= days * 86400000
        }

        let result = blogs.filter((blog) => {
            const matchesSearch =
                !q ||
                blog.title.toLowerCase().includes(q) ||
                blog.slug.toLowerCase().includes(q) ||
                blog.author?.display_name?.toLowerCase().includes(q) ||
                blog.author?.username.toLowerCase().includes(q)

            const matchesStatus = statusFilter === 'all' || blog.status === statusFilter
            const matchesCategory =
                categoryFilter === 'all' || blog.category_id === categoryFilter
            const matchesAuthor =
                authorFilter === 'all' || blog.author_id === authorFilter

            return (
                matchesSearch &&
                matchesStatus &&
                matchesCategory &&
                matchesAuthor &&
                matchesTri(blog.is_featured, featuredFilter) &&
                matchesTri(blog.is_editor_pick, editorPickFilter) &&
                matchesTri(blog.is_breaking, breakingFilter) &&
                matchesDate(blog)
            )
        })

        result = [...result].sort((a, b) => {
            switch (sort) {
                case 'oldest':
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                case 'top_views':
                    return (b.views || 0) - (a.views || 0)
                case 'top_likes':
                    return (b.likes || 0) - (a.likes || 0)
                case 'top_comments':
                    return b.comment_count - a.comment_count
                case 'title_asc':
                    return a.title.localeCompare(b.title)
                case 'title_desc':
                    return b.title.localeCompare(a.title)
                case 'recent':
                default:
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            }
        })

        return result
    }, [
        blogs, search, sort, statusFilter, categoryFilter, authorFilter,
        featuredFilter, editorPickFilter, breakingFilter, dateFilter,
    ])

    const activeFilterCount = [
        statusFilter !== 'all',
        categoryFilter !== 'all',
        authorFilter !== 'all',
        featuredFilter !== 'all',
        editorPickFilter !== 'all',
        breakingFilter !== 'all',
        dateFilter !== 'all',
        sort !== 'recent',
    ].filter(Boolean).length

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
    const paginatedBlogs = useMemo(() => {
        const start = (currentPage - 1) * pageSize
        return filtered.slice(start, start + pageSize)
    }, [filtered, currentPage, pageSize])

    useEffect(() => {
        setCurrentPage(1)
    }, [search, sort, statusFilter, categoryFilter, authorFilter, featuredFilter, editorPickFilter, breakingFilter, dateFilter, pageSize])

    function resetFilters() {
        setSearch('')
        setSort('recent')
        setStatusFilter('all')
        setCategoryFilter('all')
        setAuthorFilter('all')
        setFeaturedFilter('all')
        setEditorPickFilter('all')
        setBreakingFilter('all')
        setDateFilter('all')
        setCurrentPage(1)
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-display flex items-center gap-3">
                        <PenTool className="w-8 h-8 text-primary" />
                        Blog Management
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Filter, sort and manage all blog articles
                    </p>
                </div>
                <Link
                    href="/admin/blogs/new"
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 w-fit"
                >
                    <Plus className="w-5 h-5" />
                    Write New Blog
                </Link>
            </div>

            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    <StatCard label="Total" value={stats.total} icon={FileText} color="text-blue-500 bg-blue-500/10" />
                    <StatCard label="Published" value={stats.published} icon={PenTool} color="text-emerald-500 bg-emerald-500/10" />
                    <StatCard label="Drafts" value={stats.draft} icon={Edit} color="text-amber-500 bg-amber-500/10" />
                    <StatCard label="Archived" value={stats.archived} icon={FileText} color="text-zinc-500 bg-zinc-500/10" />
                    <StatCard label="Views" value={stats.totalViews.toLocaleString()} icon={Eye} color="text-primary bg-primary/10" />
                    <StatCard label="Likes" value={stats.totalLikes.toLocaleString()} icon={Heart} color="text-rose-500 bg-rose-500/10" />
                    <StatCard label="Comments" value={stats.totalComments.toLocaleString()} icon={MessageSquare} color="text-violet-500 bg-violet-500/10" />
                </div>
            )}

            {/* Filters */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/30 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold text-sm">Filters</span>
                        {activeFilterCount > 0 && (
                            <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                {activeFilterCount} active
                            </span>
                        )}
                    </div>
                    {activeFilterCount > 0 && (
                        <button
                            onClick={resetFilters}
                            className="text-xs text-muted-foreground hover:text-foreground underline"
                        >
                            Clear all
                        </button>
                    )}
                </div>

                <div className="p-4 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by title, slug or author..."
                            className="pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                        <FilterSelect
                            label="Sort"
                            icon={ArrowUpDown}
                            value={sort}
                            onChange={(v) => setSort(v as SortOption)}
                            options={SORT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                        />
                        <FilterSelect
                            label="Status"
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={[
                                { value: 'all', label: 'All Status' },
                                { value: 'published', label: 'Published' },
                                { value: 'draft', label: 'Draft' },
                                { value: 'archived', label: 'Archived' },
                            ]}
                        />
                        <FilterSelect
                            label="Category"
                            value={categoryFilter}
                            onChange={setCategoryFilter}
                            options={[
                                { value: 'all', label: 'All Categories' },
                                ...categories.map((c) => ({ value: c.id, label: c.name })),
                            ]}
                        />
                        <FilterSelect
                            label="Owner"
                            icon={User}
                            value={authorFilter}
                            onChange={setAuthorFilter}
                            options={[
                                { value: 'all', label: 'All Authors' },
                                ...authors.map((a) => ({ value: a.id, label: a.display_name })),
                            ]}
                        />
                        <FilterSelect
                            label="Featured"
                            icon={Star}
                            value={featuredFilter}
                            onChange={(v) => setFeaturedFilter(v as TriFilter)}
                            options={[
                                { value: 'all', label: 'All' },
                                { value: 'yes', label: 'Featured' },
                                { value: 'no', label: 'Not Featured' },
                            ]}
                        />
                        <FilterSelect
                            label="Editor Pick"
                            icon={Trophy}
                            value={editorPickFilter}
                            onChange={(v) => setEditorPickFilter(v as TriFilter)}
                            options={[
                                { value: 'all', label: 'All' },
                                { value: 'yes', label: "Editor's Pick" },
                                { value: 'no', label: 'Not Pick' },
                            ]}
                        />
                        <FilterSelect
                            label="Breaking"
                            icon={Zap}
                            value={breakingFilter}
                            onChange={(v) => setBreakingFilter(v as TriFilter)}
                            options={[
                                { value: 'all', label: 'All' },
                                { value: 'yes', label: 'Breaking' },
                                { value: 'no', label: 'Not Breaking' },
                            ]}
                        />
                        <FilterSelect
                            label="Date"
                            icon={Calendar}
                            value={dateFilter}
                            onChange={(v) => setDateFilter(v as DateFilter)}
                            options={[
                                { value: 'all', label: 'All Time' },
                                { value: '7d', label: 'Last 7 Days' },
                                { value: '30d', label: 'Last 30 Days' },
                                { value: '90d', label: 'Last 90 Days' },
                            ]}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-border bg-muted/30 flex items-center justify-between">
                    <h3 className="font-bold text-lg">All Blog Posts</h3>
                    <span className="text-xs text-muted-foreground">
                        Showing {filtered.length} of {blogs.length} articles
                    </span>
                </div>

                {error && (
                    <div className="p-6 text-center text-red-500 text-sm">{error}</div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center">
                        <PenTool className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                        <p className="text-lg font-bold mb-1">No articles found</p>
                        <p className="text-sm text-muted-foreground mb-4">
                            {blogs.length === 0
                                ? 'Start writing your first blog post!'
                                : 'Try adjusting your filters.'}
                        </p>
                        {blogs.length === 0 ? (
                            <Link href="/admin/blogs/new" className="text-primary font-bold text-sm hover:underline">
                                Write New Blog →
                            </Link>
                        ) : (
                            <button onClick={resetFilters} className="text-primary font-bold text-sm hover:underline">
                                Clear filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/40 text-muted-foreground text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold min-w-[280px]">Article</th>
                                    <th className="px-4 py-3 text-left font-semibold">Category</th>
                                    <th className="px-4 py-3 text-left font-semibold">Owner</th>
                                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                                    <th className="px-4 py-3 text-left font-semibold">Views</th>
                                    <th className="px-4 py-3 text-left font-semibold">Likes</th>
                                    <th className="px-4 py-3 text-left font-semibold">Comments</th>
                                    <th className="px-4 py-3 text-left font-semibold">Published</th>
                                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {paginatedBlogs.map((blog) => (
                                    <tr key={blog.id} className="hover:bg-accent/40 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-14 h-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                                                    {blog.cover_image ? (
                                                        <img src={blog.cover_image} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-blue-500/10">
                                                            <FileText className="w-4 h-4 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold line-clamp-1">{blog.title}</p>
                                                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                                        {blog.is_featured && (
                                                            <FlagBadge icon={Star} label="Featured" cls="text-amber-600 bg-amber-500/10" />
                                                        )}
                                                        {blog.is_editor_pick && (
                                                            <FlagBadge icon={Trophy} label="Pick" cls="text-blue-600 bg-blue-500/10" />
                                                        )}
                                                        {blog.is_breaking && (
                                                            <FlagBadge icon={Zap} label="Breaking" cls="text-red-600 bg-red-500/10" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {blog.category ? (
                                                <span
                                                    className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted"
                                                    style={blog.category.color ? { color: blog.category.color } : undefined}
                                                >
                                                    {blog.category.name}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    {blog.author?.avatar_url ? (
                                                        <img src={blog.author.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                                    ) : (
                                                        <User className="w-3.5 h-3.5 text-primary" />
                                                    )}
                                                </div>
                                                <span className="text-xs font-medium truncate max-w-[100px]">
                                                    {blog.author?.display_name || blog.author?.username || 'Unknown'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={blog.status} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="flex items-center gap-1 text-xs font-medium">
                                                <Eye className="w-3 h-3 text-muted-foreground" />
                                                {(blog.views || 0).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="flex items-center gap-1 text-xs font-medium">
                                                <Heart className="w-3 h-3 text-muted-foreground" />
                                                {(blog.likes || 0).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={cn(
                                                'flex items-center gap-1 text-xs font-medium',
                                                blog.comment_count > 0 ? 'text-violet-600' : 'text-muted-foreground'
                                            )}>
                                                <MessageSquare className="w-3 h-3" />
                                                {blog.comment_count}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                            {blog.published_at
                                                ? formatDate(blog.published_at)
                                                : formatDate(blog.created_at)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Link
                                                    href={`/blog/${blog.slug}`}
                                                    target="_blank"
                                                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                                                    title="View"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={`/admin/blogs/${blog.id}/edit`}
                                                    className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <DeleteBlogButton id={blog.id} title={blog.title} onDeleted={fetchBlogs} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Admin Table Pagination Footer */}
                {filtered.length > 0 && (
                    <div className="p-4 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                            <span>
                                Showing <strong className="text-foreground">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
                                <strong className="text-foreground">{Math.min(currentPage * pageSize, filtered.length)}</strong> of{' '}
                                <strong className="text-foreground">{filtered.length}</strong>
                            </span>
                            <div className="flex items-center gap-1.5 border-l border-border pl-3">
                                <span>Per page:</span>
                                <select
                                    value={pageSize}
                                    onChange={(e) => setPageSize(Number(e.target.value))}
                                    className="bg-background border border-border rounded-md px-1.5 py-0.5 text-xs font-semibold focus:outline-none"
                                >
                                    <option value={10}>10</option>
                                    <option value={15}>15</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage <= 1}
                                    aria-label="First page"
                                    className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                >
                                    <ChevronsLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage <= 1}
                                    aria-label="Previous page"
                                    className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="px-2 font-medium">
                                    Page <strong className="text-foreground">{currentPage}</strong> of <strong className="text-foreground">{totalPages}</strong>
                                </span>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage >= totalPages}
                                    aria-label="Next page"
                                    className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage >= totalPages}
                                    aria-label="Last page"
                                    className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                >
                                    <ChevronsRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

function FilterSelect({
    label, value, onChange, options, icon: Icon,
}: {
    label: string
    value: string
    onChange: (v: string) => void
    options: { value: string; label: string }[]
    icon?: React.ComponentType<{ className?: string }>
}) {
    return (
        <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                {Icon && <Icon className="w-3 h-3" />}
                {label}
            </label>
            <select
                className="w-full bg-background border border-border rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
        </div>
    )
}

function StatCard({ label, value, icon: Icon, color }: {
    label: string
    value: string | number
    icon: React.ComponentType<{ className?: string }>
    color: string
}) {
    const [textColor, bgColor] = color.split(' ')
    return (
        <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-3">
            <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', bgColor)}>
                <Icon className={cn('w-4 h-4', textColor)} />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground font-medium truncate">{label}</p>
                <p className="text-lg font-bold">{value}</p>
            </div>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, string> = {
        published: 'bg-emerald-500/10 text-emerald-600',
        draft: 'bg-amber-500/10 text-amber-600',
        archived: 'bg-zinc-500/10 text-zinc-500',
    }
    return (
        <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase', config[status] || config.draft)}>
            {status}
        </span>
    )
}

function FlagBadge({
    icon: Icon, label, cls,
}: {
    icon: React.ComponentType<{ className?: string }>
    label: string
    cls: string
}) {
    return (
        <span className={cn('inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold', cls)}>
            <Icon className="w-2.5 h-2.5" />
            {label}
        </span>
    )
}
