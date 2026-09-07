'use client'

import { useCallback, useEffect, useState } from 'react'
import {
    FolderTree, Plus, Trash2, Loader2, Save, X, Edit, Search,
    ChevronDown, ChevronRight, Users, HelpCircle, FileText,
    Link as LinkIcon, Palette, Hash, MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/providers/AuthProvider'
import { toast } from 'sonner'

/* ── Types ── */
interface FaqItem { question: string; answer: string }

interface Category {
    id: string
    name: string
    slug: string
    color?: string
    emoji?: string
    description?: string
    meta_title?: string
    meta_description?: string
    faqs?: FaqItem[]
    sort_order?: number
    player_count?: number
    faq_count?: number
}

interface PageOption {
    id: string; title: string; slug: string
    page_title?: string; banner_image?: string; status: string
}

interface Player {
    id: string; player_name: string; player_image?: string
    player_url?: string; sort_order: number
}

/* ── Slug Helper ── */
function slugify(t: string) {
    return t.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '')
}

/* ── Emoji Presets ── */
const EMOJIS = ['🏏', '⚽', '🏀', '🎾', '🏎️', '🏈', '⚾', '🏉', '🥇', '🌍', '🏑', '🏐', '🥊', '⛳', '🎯', '🏋️']

/* ── Color Presets ── */
const COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#64748b',
]

export function CategoryManagerPanel() {
    const { getToken } = useAuth()

    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)

    // Editing / Creating
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isCreating, setIsCreating] = useState(false)

    // Form state
    const [formName, setFormName] = useState('')
    const [formSlug, setFormSlug] = useState('')
    const [slugEdited, setSlugEdited] = useState(false)
    const [formColor, setFormColor] = useState('#6366f1')
    const [formEmoji, setFormEmoji] = useState('')
    const [formDesc, setFormDesc] = useState('')
    const [formMetaTitle, setFormMetaTitle] = useState('')
    const [formMetaDesc, setFormMetaDesc] = useState('')
    const [formFaqs, setFormFaqs] = useState<FaqItem[]>([])
    const [formSortOrder, setFormSortOrder] = useState(99)

    // Team pages linking
    const [players, setPlayers] = useState<Player[]>([])
    const [pages, setPages] = useState<PageOption[]>([])
    const [pageSearch, setPageSearch] = useState('')
    const [pageDropdownOpen, setPageDropdownOpen] = useState(false)
    const [selectedPageId, setSelectedPageId] = useState('')
    const [addingPlayer, setAddingPlayer] = useState(false)
    const [deletingPlayerId, setDeletingPlayerId] = useState<string | null>(null)

    // Expand sections
    const [expandedSection, setExpandedSection] = useState<'details' | 'team' | 'faq'>('details')

    const [saving, setSaving] = useState(false)
    const [deletingCatId, setDeletingCatId] = useState<string | null>(null)

    /* ── Fetch Categories ── */
    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/categories', {
                headers: { Authorization: `Bearer ${getToken()}` },
            })
            if (res.ok) {
                const data = await res.json()
                setCategories(data.categories || [])
            }
        } catch {
            toast.error('Failed to load categories')
        } finally {
            setLoading(false)
        }
    }, [getToken])

    useEffect(() => { fetchCategories() }, [fetchCategories])

    /* ── Fetch Pages (for team link dropdown) ── */
    useEffect(() => {
        async function loadPages() {
            try {
                const res = await fetch('/api/admin/pages', {
                    headers: { Authorization: `Bearer ${getToken()}` },
                })
                if (res.ok) {
                    const data = await res.json()
                    setPages(data.pages || [])
                }
            } catch { /* ignore */ }
        }
        loadPages()
    }, [getToken])

    /* ── Fetch Category Detail (players + faqs) ── */
    async function loadCategoryDetail(catId: string) {
        try {
            const res = await fetch(`/api/admin/categories/${catId}`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            })
            if (res.ok) {
                const data = await res.json()
                const cat = data.category
                setFormName(cat.name || '')
                setFormSlug(cat.slug || '')
                setSlugEdited(true)
                setFormColor(cat.color || '#6366f1')
                setFormEmoji(cat.emoji || '')
                setFormDesc(cat.description || '')
                setFormMetaTitle(cat.meta_title || '')
                setFormMetaDesc(cat.meta_description || '')
                setFormFaqs(Array.isArray(cat.faqs) ? cat.faqs : [])
                setFormSortOrder(cat.sort_order ?? 99)
                setPlayers(cat.players || [])
            }
        } catch {
            toast.error('Failed to load category details')
        }
    }

    /* ── Open Editor ── */
    function openCreate() {
        setEditingId(null)
        setIsCreating(true)
        resetForm()
        setExpandedSection('details')
    }

    function openEdit(cat: Category) {
        setIsCreating(false)
        setEditingId(cat.id)
        loadCategoryDetail(cat.id)
        setExpandedSection('details')
    }

    function closeEditor() {
        setEditingId(null)
        setIsCreating(false)
        resetForm()
    }

    function resetForm() {
        setFormName(''); setFormSlug(''); setSlugEdited(false)
        setFormColor('#6366f1'); setFormEmoji(''); setFormDesc('')
        setFormMetaTitle(''); setFormMetaDesc(''); setFormFaqs([])
        setFormSortOrder(99); setPlayers([]); setSelectedPageId(''); setPageSearch('')
    }

    /* ── Auto-slug ── */
    useEffect(() => {
        if (!slugEdited && formName) {
            setFormSlug(slugify(formName))
        }
    }, [formName, slugEdited])

    /* ── Save Category ── */
    async function handleSave() {
        if (!formName.trim() || !formSlug.trim()) {
            toast.error('Name and slug are required')
            return
        }
        setSaving(true)
        try {
            const payload = {
                name: formName.trim(),
                slug: formSlug.trim(),
                color: formColor,
                emoji: formEmoji || null,
                description: formDesc.trim() || null,
                meta_title: formMetaTitle.trim() || null,
                meta_description: formMetaDesc.trim() || null,
                faqs: formFaqs.filter(f => f.question.trim() && f.answer.trim()),
                sort_order: formSortOrder,
            }

            const url = isCreating ? '/api/admin/categories' : `/api/admin/categories/${editingId}`
            const method = isCreating ? 'POST' : 'PUT'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
                body: JSON.stringify(payload),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to save')

            toast.success(isCreating ? 'Category created!' : 'Category updated!')
            closeEditor()
            fetchCategories()
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed to save category')
        } finally {
            setSaving(false)
        }
    }

    /* ── Delete Category ── */
    async function handleDeleteCategory(id: string, name: string) {
        if (!confirm(`Delete "${name}"? This will also remove linked team pages.`)) return
        setDeletingCatId(id)
        try {
            const res = await fetch(`/api/admin/categories/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${getToken()}` },
            })
            if (!res.ok) throw new Error('Failed to delete')
            toast.success('Category deleted')
            if (editingId === id) closeEditor()
            fetchCategories()
        } catch {
            toast.error('Failed to delete category')
        } finally {
            setDeletingCatId(null)
        }
    }

    /* ── Add Team Page ── */
    async function handleAddPlayer() {
        if (!editingId || !selectedPageId) return
        const page = pages.find(p => p.id === selectedPageId)
        if (!page) return
        setAddingPlayer(true)
        try {
            const res = await fetch('/api/admin/category-players', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
                body: JSON.stringify({
                    category_id: editingId,
                    player_name: page.page_title || page.title,
                    player_image: page.banner_image || null,
                    player_url: `/${page.slug}`,
                    sort_order: players.length,
                }),
            })
            if (!res.ok) throw new Error('Failed to add')
            toast.success('Page linked!')
            setSelectedPageId('')
            setPageSearch('')
            loadCategoryDetail(editingId)
            fetchCategories()
        } catch {
            toast.error('Failed to link page')
        } finally {
            setAddingPlayer(false)
        }
    }

    /* ── Remove Team Page ── */
    async function handleRemovePlayer(playerId: string) {
        setDeletingPlayerId(playerId)
        try {
            const res = await fetch(`/api/admin/category-players/${playerId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${getToken()}` },
            })
            if (!res.ok) throw new Error('Failed to remove')
            toast.success('Removed')
            if (editingId) loadCategoryDetail(editingId)
            fetchCategories()
        } catch {
            toast.error('Failed to remove')
        } finally {
            setDeletingPlayerId(null)
        }
    }

    /* ── FAQ Helpers ── */
    function addFaq() {
        setFormFaqs(prev => [...prev, { question: '', answer: '' }])
    }
    function updateFaq(index: number, field: 'question' | 'answer', value: string) {
        setFormFaqs(prev => prev.map((f, i) => i === index ? { ...f, [field]: value } : f))
    }
    function removeFaq(index: number) {
        setFormFaqs(prev => prev.filter((_, i) => i !== index))
    }

    /* ── Filtered Pages ── */
    const filteredPages = pages.filter(p =>
        (p.page_title || p.title).toLowerCase().includes(pageSearch.toLowerCase()) ||
        p.slug.toLowerCase().includes(pageSearch.toLowerCase())
    )
    const selectedPage = pages.find(p => p.id === selectedPageId)

    const isEditorOpen = isCreating || editingId !== null

    /* ── Render ── */
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-display flex items-center gap-2">
                        <FolderTree className="w-6 h-6 text-primary" />
                        Categories
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage sport categories, link team pages, and add FAQs
                    </p>
                </div>
                {!isEditorOpen && (
                    <button
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
                    >
                        <Plus className="w-4 h-4" />
                        New Category
                    </button>
                )}
            </div>

            {/* Editor Panel */}
            {isEditorOpen && (
                <div className="rounded-2xl border border-primary/30 bg-card overflow-hidden shadow-lg">
                    {/* Editor Header */}
                    <div className="flex items-center justify-between px-6 py-4 bg-primary/5 border-b border-primary/20">
                        <h2 className="text-sm font-bold flex items-center gap-2">
                            {formEmoji && <span className="text-lg">{formEmoji}</span>}
                            {isCreating ? 'Create New Category' : `Edit: ${formName || 'Category'}`}
                        </h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                {isCreating ? 'Create' : 'Save Changes'}
                            </button>
                            <button onClick={closeEditor} className="p-2 rounded-lg hover:bg-accent transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Section Tabs */}
                    <div className="flex border-b border-border">
                        {[
                            { key: 'details' as const, label: 'Details', icon: Edit },
                            ...(!isCreating ? [
                                { key: 'team' as const, label: `Team Pages (${players.length})`, icon: Users },
                            ] : []),
                            { key: 'faq' as const, label: `FAQs (${formFaqs.length})`, icon: HelpCircle },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setExpandedSection(tab.key)}
                                className={cn(
                                    'flex items-center gap-1.5 px-5 py-3 text-xs font-bold transition-colors border-b-2 -mb-px',
                                    expandedSection === tab.key
                                        ? 'text-primary border-primary'
                                        : 'text-muted-foreground border-transparent hover:text-foreground'
                                )}
                            >
                                <tab.icon className="w-3.5 h-3.5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-6">
                        {/* ── Details Tab ── */}
                        {expandedSection === 'details' && (
                            <div className="space-y-5">
                                {/* Name & Slug Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-foreground mb-1.5">Category Name *</label>
                                        <input
                                            value={formName}
                                            onChange={e => setFormName(e.target.value)}
                                            placeholder="e.g. Cricket"
                                            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-foreground mb-1.5">Slug *</label>
                                        <input
                                            value={formSlug}
                                            onChange={e => { setFormSlug(e.target.value); setSlugEdited(true) }}
                                            placeholder="e.g. cricket"
                                            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 outline-none font-mono"
                                        />
                                    </div>
                                </div>

                                {/* Emoji & Color Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-foreground mb-1.5">
                                            <span className="flex items-center gap-1"><Hash className="w-3 h-3" /> Emoji</span>
                                        </label>
                                        <div className="flex flex-wrap gap-1.5 mb-2">
                                            {EMOJIS.map(e => (
                                                <button
                                                    key={e}
                                                    type="button"
                                                    onClick={() => setFormEmoji(e)}
                                                    className={cn(
                                                        'w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all',
                                                        formEmoji === e
                                                            ? 'bg-primary/20 ring-2 ring-primary scale-110'
                                                            : 'bg-muted hover:bg-accent'
                                                    )}
                                                >
                                                    {e}
                                                </button>
                                            ))}
                                        </div>
                                        <input
                                            value={formEmoji}
                                            onChange={e => setFormEmoji(e.target.value)}
                                            placeholder="Or type custom emoji…"
                                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                                            maxLength={4}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-foreground mb-1.5">
                                            <span className="flex items-center gap-1"><Palette className="w-3 h-3" /> Color</span>
                                        </label>
                                        <div className="flex flex-wrap gap-1.5 mb-2">
                                            {COLORS.map(c => (
                                                <button
                                                    key={c}
                                                    type="button"
                                                    onClick={() => setFormColor(c)}
                                                    className={cn(
                                                        'w-7 h-7 rounded-full transition-all',
                                                        formColor === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-105'
                                                    )}
                                                    style={{ backgroundColor: c }}
                                                />
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg border border-border" style={{ backgroundColor: formColor }} />
                                            <input
                                                value={formColor}
                                                onChange={e => setFormColor(e.target.value)}
                                                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono focus:ring-2 focus:ring-primary/30 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-xs font-bold text-foreground mb-1.5">Description</label>
                                    <textarea
                                        value={formDesc}
                                        onChange={e => setFormDesc(e.target.value)}
                                        placeholder="Brief description of this category…"
                                        rows={2}
                                        className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 outline-none resize-none"
                                    />
                                </div>

                                {/* SEO */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-foreground mb-1.5">Meta Title</label>
                                        <input
                                            value={formMetaTitle}
                                            onChange={e => setFormMetaTitle(e.target.value)}
                                            placeholder="SEO title (max 70 chars)"
                                            maxLength={70}
                                            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                                        />
                                        <p className="text-[10px] text-muted-foreground mt-1">{formMetaTitle.length}/70</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-foreground mb-1.5">Meta Description</label>
                                        <input
                                            value={formMetaDesc}
                                            onChange={e => setFormMetaDesc(e.target.value)}
                                            placeholder="SEO description (max 160 chars)"
                                            maxLength={160}
                                            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                                        />
                                        <p className="text-[10px] text-muted-foreground mt-1">{formMetaDesc.length}/160</p>
                                    </div>
                                </div>

                                {/* Sort Order */}
                                <div className="max-w-[120px]">
                                    <label className="block text-xs font-bold text-foreground mb-1.5">Sort Order</label>
                                    <input
                                        type="number"
                                        value={formSortOrder}
                                        onChange={e => setFormSortOrder(parseInt(e.target.value) || 0)}
                                        className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                                    />
                                </div>
                            </div>
                        )}

                        {/* ── Team Pages Tab ── */}
                        {expandedSection === 'team' && !isCreating && (
                            <div className="space-y-4">
                                <p className="text-xs text-muted-foreground">
                                    Link custom pages to this category. They show as player/team cards on category pages and blog posts.
                                </p>

                                {/* Add Page Dropdown */}
                                <div className="flex items-end gap-3">
                                    <div className="flex-1 relative">
                                        <label className="block text-xs font-bold text-foreground mb-1.5">Select Page to Link</label>
                                        <div
                                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-border bg-card cursor-pointer hover:border-primary/50 transition-colors"
                                            onClick={() => setPageDropdownOpen(!pageDropdownOpen)}
                                        >
                                            <span className={cn('text-sm', selectedPage ? 'text-foreground font-medium' : 'text-muted-foreground')}>
                                                {selectedPage ? (selectedPage.page_title || selectedPage.title) : 'Choose a page…'}
                                            </span>
                                            <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', pageDropdownOpen && 'rotate-180')} />
                                        </div>
                                        {pageDropdownOpen && (
                                            <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-xl border border-border bg-card shadow-xl max-h-[300px] overflow-hidden">
                                                <div className="p-2 border-b border-border">
                                                    <input
                                                        value={pageSearch}
                                                        onChange={e => setPageSearch(e.target.value)}
                                                        placeholder="Search pages…"
                                                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                                                        autoFocus
                                                    />
                                                </div>
                                                <div className="max-h-[240px] overflow-y-auto">
                                                    {filteredPages.length === 0 ? (
                                                        <div className="px-4 py-6 text-center text-xs text-muted-foreground">No pages found</div>
                                                    ) : (
                                                        filteredPages.map(page => (
                                                            <button
                                                                key={page.id}
                                                                onClick={() => {
                                                                    setSelectedPageId(page.id)
                                                                    setPageDropdownOpen(false)
                                                                    setPageSearch('')
                                                                }}
                                                                className={cn(
                                                                    'w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-accent transition-colors',
                                                                    selectedPageId === page.id && 'bg-primary/10'
                                                                )}
                                                            >
                                                                <div className="w-9 h-9 rounded-lg bg-muted border border-border overflow-hidden flex-shrink-0">
                                                                    {page.banner_image ? (
                                                                        <img src={page.banner_image} alt="" className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center">
                                                                            <FileText className="w-3.5 h-3.5 text-muted-foreground/40" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-semibold truncate">{page.page_title || page.title}</p>
                                                                    <p className="text-[10px] text-muted-foreground">/{page.slug}</p>
                                                                </div>
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleAddPlayer}
                                        disabled={addingPlayer || !selectedPageId}
                                        className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
                                    >
                                        {addingPlayer ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                                        Link Page
                                    </button>
                                </div>

                                {/* Linked Players Grid */}
                                {players.length === 0 ? (
                                    <div className="py-10 text-center rounded-xl border border-dashed border-border">
                                        <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                                        <p className="text-sm font-semibold text-muted-foreground">No team pages linked yet</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                        {players.map(player => (
                                            <div key={player.id} className="rounded-xl border border-border bg-card overflow-hidden group hover:shadow-md transition-all">
                                                <div className="relative aspect-square bg-muted">
                                                    {player.player_image ? (
                                                        <img src={player.player_image} alt={player.player_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Users className="w-8 h-8 text-muted-foreground/30" />
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={() => handleRemovePlayer(player.id)}
                                                        disabled={deletingPlayerId === player.id}
                                                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                                                    >
                                                        {deletingPlayerId === player.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                                    </button>
                                                </div>
                                                <div className="p-2 text-center">
                                                    <p className="text-xs font-bold truncate">{player.player_name}</p>
                                                    {player.player_url && (
                                                        <p className="text-[9px] text-muted-foreground truncate mt-0.5 flex items-center justify-center gap-0.5">
                                                            <LinkIcon className="w-2 h-2" />
                                                            {player.player_url}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── FAQ Tab ── */}
                        {expandedSection === 'faq' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-muted-foreground">
                                        Add FAQs for this category. They appear on the category page with SEO schema markup.
                                    </p>
                                    <button
                                        onClick={addFaq}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
                                    >
                                        <Plus className="w-3 h-3" />
                                        Add FAQ
                                    </button>
                                </div>

                                {formFaqs.length === 0 ? (
                                    <div className="py-10 text-center rounded-xl border border-dashed border-border">
                                        <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                                        <p className="text-sm font-semibold text-muted-foreground">No FAQs yet</p>
                                        <p className="text-xs text-muted-foreground mt-1">Add questions and answers that appear on category pages</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {formFaqs.map((faq, i) => (
                                            <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full flex-shrink-0 mt-1">
                                                        Q{i + 1}
                                                    </span>
                                                    <button
                                                        onClick={() => removeFaq(i)}
                                                        className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                <input
                                                    value={faq.question}
                                                    onChange={e => updateFaq(i, 'question', e.target.value)}
                                                    placeholder="Question…"
                                                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm font-semibold focus:ring-2 focus:ring-primary/30 outline-none"
                                                />
                                                <textarea
                                                    value={faq.answer}
                                                    onChange={e => updateFaq(i, 'answer', e.target.value)}
                                                    placeholder="Answer…"
                                                    rows={3}
                                                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/30 outline-none resize-none"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {formFaqs.length > 0 && (
                                    <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3">
                                        <p className="text-[11px] text-emerald-700 font-semibold">
                                            ✅ {formFaqs.filter(f => f.question.trim() && f.answer.trim()).length} valid FAQ(s) will be saved
                                            — Remember to click &quot;Save Changes&quot; above!
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Category List */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
            ) : categories.length === 0 ? (
                <div className="py-16 text-center rounded-2xl border border-dashed border-border bg-muted/20">
                    <FolderTree className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm font-semibold">No categories yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Create your first category to get started</p>
                </div>
            ) : (
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/30">
                                    <th className="text-left px-5 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Category</th>
                                    <th className="text-left px-5 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Slug</th>
                                    <th className="text-center px-5 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Players</th>
                                    <th className="text-center px-5 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">FAQs</th>
                                    <th className="text-center px-5 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Order</th>
                                    <th className="text-right px-5 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map(cat => (
                                    <tr
                                        key={cat.id}
                                        className={cn(
                                            'border-b border-border/50 hover:bg-accent/30 transition-colors',
                                            editingId === cat.id && 'bg-primary/5'
                                        )}
                                    >
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                                                    style={{ backgroundColor: cat.color || '#6366f1' }}
                                                >
                                                    {cat.emoji || cat.name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground">{cat.name}</p>
                                                    {cat.description && (
                                                        <p className="text-[10px] text-muted-foreground line-clamp-1 max-w-[250px]">{cat.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 hidden md:table-cell">
                                            <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{cat.slug}</code>
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            <span className="inline-flex items-center gap-1 text-xs font-bold">
                                                <Users className="w-3 h-3 text-muted-foreground" />
                                                {cat.player_count ?? 0}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            <span className="inline-flex items-center gap-1 text-xs font-bold">
                                                <HelpCircle className="w-3 h-3 text-muted-foreground" />
                                                {cat.faq_count ?? 0}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            <span className="text-xs text-muted-foreground">{cat.sort_order ?? '-'}</span>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => openEdit(cat)}
                                                    className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                                    disabled={deletingCatId === cat.id}
                                                    className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                                                    title="Delete"
                                                >
                                                    {deletingCatId === cat.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Info */}
            <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-3">
                <p className="text-[11px] text-blue-600 font-semibold mb-1">💡 How categories work</p>
                <ul className="text-[11px] text-blue-600/80 space-y-0.5">
                    <li>• Categories appear in header navigation and blog filters</li>
                    <li>• <strong>Team Pages</strong> linked here show as player cards on category and blog pages</li>
                    <li>• <strong>FAQs</strong> render with SEO-optimized schema markup on category pages</li>
                    <li>• Slug determines the URL: <code>/sports/your-slug</code></li>
                </ul>
            </div>
        </div>
    )
}
