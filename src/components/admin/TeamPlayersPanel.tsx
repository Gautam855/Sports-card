'use client'

import { useCallback, useEffect, useState } from 'react'
import {
    Users, Plus, Trash2, Loader2, Save, X, Edit,
    Link as LinkIcon, FileText, ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/providers/AuthProvider'
import { toast } from 'sonner'

interface Category {
    id: string
    name: string
    slug: string
    color?: string
}

interface PageOption {
    id: string
    title: string
    slug: string
    page_title?: string
    banner_image?: string
    status: string
}

interface Player {
    id: string
    category_id: string
    player_name: string
    player_image: string | null
    player_url: string | null
    sort_order: number
    category?: Category
}

export function TeamPlayersPanel() {
    const { getToken } = useAuth()
    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string>('')
    const [players, setPlayers] = useState<Player[]>([])
    const [pages, setPages] = useState<PageOption[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showAddForm, setShowAddForm] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    // Add form
    const [selectedPageId, setSelectedPageId] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [dropdownOpen, setDropdownOpen] = useState(false)

    // Fetch categories
    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await fetch('/api/admin/blogs/categories', {
                    headers: { Authorization: `Bearer ${getToken()}` },
                })
                if (res.ok) {
                    const data = await res.json()
                    const cats = data.categories || []
                    setCategories(cats)
                    if (cats.length > 0) setSelectedCategory(cats[0].id)
                }
            } catch {
                toast.error('Failed to load categories')
            }
        }
        fetchCategories()
    }, [getToken])

    // Fetch pages for dropdown
    useEffect(() => {
        async function fetchPages() {
            try {
                const res = await fetch('/api/admin/pages', {
                    headers: { Authorization: `Bearer ${getToken()}` },
                })
                if (res.ok) {
                    const data = await res.json()
                    setPages(data.pages || [])
                }
            } catch {
                // ignore
            }
        }
        fetchPages()
    }, [getToken])

    // Fetch players for selected category
    const fetchPlayers = useCallback(async () => {
        if (!selectedCategory) return
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/category-players?category_id=${selectedCategory}`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            })
            if (res.ok) {
                const data = await res.json()
                setPlayers(data.players || [])
            }
        } catch {
            toast.error('Failed to load players')
        } finally {
            setLoading(false)
        }
    }, [selectedCategory, getToken])

    useEffect(() => {
        fetchPlayers()
    }, [fetchPlayers])

    // Filter pages by search
    const filteredPages = pages.filter(p =>
        (p.page_title || p.title).toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Get selected page data
    const selectedPage = pages.find(p => p.id === selectedPageId)

    // Add player from selected page
    async function handleAddFromPage() {
        if (!selectedPage) {
            toast.error('Please select a page')
            return
        }
        setSaving(true)
        try {
            const res = await fetch('/api/admin/category-players', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({
                    category_id: selectedCategory,
                    player_name: selectedPage.page_title || selectedPage.title,
                    player_image: selectedPage.banner_image || null,
                    player_url: `/${selectedPage.slug}`,
                    sort_order: players.length,
                }),
            })
            if (!res.ok) throw new Error('Failed to add')
            toast.success('Player page added!')
            setSelectedPageId('')
            setSearchQuery('')
            setShowAddForm(false)
            fetchPlayers()
        } catch {
            toast.error('Failed to add player')
        } finally {
            setSaving(false)
        }
    }

    // Delete player
    async function handleDelete(id: string, name: string) {
        if (!confirm(`Remove "${name}"?`)) return
        setDeletingId(id)
        try {
            const res = await fetch(`/api/admin/category-players/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${getToken()}` },
            })
            if (!res.ok) throw new Error('Failed to delete')
            toast.success('Removed')
            fetchPlayers()
        } catch {
            toast.error('Failed to remove')
        } finally {
            setDeletingId(null)
        }
    }

    const selectedCat = categories.find(c => c.id === selectedCategory)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-display flex items-center gap-2">
                        <Users className="w-6 h-6 text-primary" />
                        Team Players
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Link custom pages to categories — they show at the end of blog posts
                    </p>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => { setSelectedCategory(cat.id); setShowAddForm(false) }}
                        className={cn(
                            'px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                            selectedCategory === cat.id
                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                                : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                        )}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Players List */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Add Button */}
                    {!showAddForm && (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary/50 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Page to {selectedCat?.name || 'Category'}
                        </button>
                    )}

                    {/* Add Form — Pages Dropdown */}
                    {showAddForm && (
                        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 space-y-4">
                            <h3 className="text-sm font-bold flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" />
                                Select a Custom Page
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                Choose a page — its title and banner image will show as a player card in {selectedCat?.name} blog posts.
                            </p>

                            {/* Searchable Dropdown */}
                            <div className="relative">
                                <div
                                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-border bg-card cursor-pointer hover:border-primary/50 transition-colors"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                >
                                    <span className={cn('text-sm', selectedPage ? 'text-foreground font-medium' : 'text-muted-foreground')}>
                                        {selectedPage ? (selectedPage.page_title || selectedPage.title) : 'Select a page...'}
                                    </span>
                                    <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', dropdownOpen && 'rotate-180')} />
                                </div>

                                {dropdownOpen && (
                                    <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-xl border border-border bg-card shadow-xl max-h-[300px] overflow-hidden">
                                        {/* Search */}
                                        <div className="p-2 border-b border-border">
                                            <input
                                                value={searchQuery}
                                                onChange={e => setSearchQuery(e.target.value)}
                                                placeholder="Search pages..."
                                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                                                autoFocus
                                            />
                                        </div>
                                        {/* Options */}
                                        <div className="max-h-[240px] overflow-y-auto">
                                            {filteredPages.length === 0 ? (
                                                <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                                                    No pages found
                                                </div>
                                            ) : (
                                                filteredPages.map(page => (
                                                    <button
                                                        key={page.id}
                                                        onClick={() => {
                                                            setSelectedPageId(page.id)
                                                            setDropdownOpen(false)
                                                            setSearchQuery('')
                                                        }}
                                                        className={cn(
                                                            'w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-accent transition-colors',
                                                            selectedPageId === page.id && 'bg-primary/10'
                                                        )}
                                                    >
                                                        {/* Page thumbnail */}
                                                        <div className="w-10 h-10 rounded-lg bg-muted border border-border overflow-hidden flex-shrink-0">
                                                            {page.banner_image ? (
                                                                <img src={page.banner_image} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <FileText className="w-4 h-4 text-muted-foreground/40" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold truncate">{page.page_title || page.title}</p>
                                                            <p className="text-[10px] text-muted-foreground">/{page.slug}</p>
                                                        </div>
                                                        <span className={cn(
                                                            'text-[9px] font-bold px-1.5 py-0.5 rounded',
                                                            page.status === 'published' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                                                        )}>
                                                            {page.status === 'published' ? 'Live' : 'Draft'}
                                                        </span>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Preview of selected page */}
                            {selectedPage && (
                                <div className="rounded-lg border border-border bg-card p-3 flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-muted border border-border overflow-hidden flex-shrink-0">
                                        {selectedPage.banner_image ? (
                                            <img src={selectedPage.banner_image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <FileText className="w-6 h-6 text-muted-foreground/30" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate">{selectedPage.page_title || selectedPage.title}</p>
                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                            <LinkIcon className="w-2.5 h-2.5" />
                                            /{selectedPage.slug}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => { setShowAddForm(false); setSelectedPageId(''); setSearchQuery('') }}
                                    className="px-4 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:bg-accent transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddFromPage}
                                    disabled={saving || !selectedPageId}
                                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                                    Add to {selectedCat?.name}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Players Grid */}
                    {players.length === 0 && !showAddForm ? (
                        <div className="py-16 text-center rounded-xl border border-dashed border-border">
                            <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-sm font-semibold">No players in {selectedCat?.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">Add pages that will show as player cards at the end of blog posts</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {players.map(player => (
                                <div
                                    key={player.id}
                                    className="rounded-xl border border-border bg-card overflow-hidden group hover:shadow-lg hover:-translate-y-0.5 transition-all"
                                >
                                    {/* Image */}
                                    <div className="relative aspect-square bg-muted">
                                        {player.player_image ? (
                                            <img src={player.player_image} alt={player.player_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Users className="w-8 h-8 text-muted-foreground/30" />
                                            </div>
                                        )}
                                        {/* Delete overlay */}
                                        <button
                                            onClick={() => handleDelete(player.id, player.player_name)}
                                            disabled={deletingId === player.id}
                                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                                        >
                                            {deletingId === player.id ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-3.5 h-3.5" />
                                            )}
                                        </button>
                                    </div>
                                    {/* Name */}
                                    <div className="p-2.5 text-center">
                                        <p className="text-xs font-bold truncate">{player.player_name}</p>
                                        {player.player_url && (
                                            <p className="text-[9px] text-muted-foreground truncate mt-0.5">{player.player_url}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Info */}
            <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-3">
                <p className="text-[11px] text-blue-600 font-semibold mb-1">💡 How it works</p>
                <ul className="text-[11px] text-blue-600/80 space-y-0.5">
                    <li>• Select a category tab → Add pages from the dropdown</li>
                    <li>• The page&apos;s <strong>title</strong> and <strong>banner image</strong> become the player card</li>
                    <li>• Player cards appear at the bottom of every blog post in that category</li>
                    <li>• Clicking a player card takes the user to that page</li>
                </ul>
            </div>
        </div>
    )
}
