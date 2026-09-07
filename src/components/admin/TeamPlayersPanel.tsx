'use client'

import { useCallback, useEffect, useState } from 'react'
import {
    Users, Plus, Trash2, Loader2, Upload, Save, X, Edit,
    Image as ImageIcon, Link as LinkIcon, GripVertical,
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
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showAddForm, setShowAddForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    // New player form
    const [newName, setNewName] = useState('')
    const [newImage, setNewImage] = useState('')
    const [newUrl, setNewUrl] = useState('')
    const [uploading, setUploading] = useState(false)

    // Edit form
    const [editName, setEditName] = useState('')
    const [editImage, setEditImage] = useState('')
    const [editUrl, setEditUrl] = useState('')

    // Fetch categories
    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await fetch('/api/admin/blogs/categories', {
                    headers: { Authorization: `Bearer ${getToken()}` },
                })
                if (res.ok) {
                    const data = await res.json()
                    const cats = data.categories || data || []
                    setCategories(cats)
                    if (cats.length > 0) setSelectedCategory(cats[0].id)
                }
            } catch {
                toast.error('Failed to load categories')
            }
        }
        fetchCategories()
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

    // Upload image
    async function handleImageUpload(file: File, target: 'new' | 'edit') {
        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            const res = await fetch('/api/upload', {
                method: 'POST',
                headers: { Authorization: `Bearer ${getToken()}` },
                body: formData,
            })
            if (!res.ok) throw new Error('Upload failed')
            const data = await res.json()
            const url = data.url || data.publicUrl
            if (target === 'new') setNewImage(url)
            else setEditImage(url)
            toast.success('Image uploaded!')
        } catch {
            toast.error('Image upload failed')
        } finally {
            setUploading(false)
        }
    }

    // Add player
    async function handleAdd() {
        if (!newName.trim()) {
            toast.error('Player name is required')
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
                    player_name: newName,
                    player_image: newImage || null,
                    player_url: newUrl || null,
                    sort_order: players.length,
                }),
            })
            if (!res.ok) throw new Error('Failed to add')
            toast.success('Player added!')
            setNewName('')
            setNewImage('')
            setNewUrl('')
            setShowAddForm(false)
            fetchPlayers()
        } catch {
            toast.error('Failed to add player')
        } finally {
            setSaving(false)
        }
    }

    // Update player
    async function handleUpdate(id: string) {
        setSaving(true)
        try {
            const res = await fetch(`/api/admin/category-players/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({
                    player_name: editName,
                    player_image: editImage || null,
                    player_url: editUrl || null,
                }),
            })
            if (!res.ok) throw new Error('Failed to update')
            toast.success('Player updated!')
            setEditingId(null)
            fetchPlayers()
        } catch {
            toast.error('Failed to update player')
        } finally {
            setSaving(false)
        }
    }

    // Delete player
    async function handleDelete(id: string, name: string) {
        if (!confirm(`Delete "${name}"?`)) return
        setDeletingId(id)
        try {
            const res = await fetch(`/api/admin/category-players/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${getToken()}` },
            })
            if (!res.ok) throw new Error('Failed to delete')
            toast.success('Player deleted')
            fetchPlayers()
        } catch {
            toast.error('Failed to delete player')
        } finally {
            setDeletingId(null)
        }
    }

    function startEdit(player: Player) {
        setEditingId(player.id)
        setEditName(player.player_name)
        setEditImage(player.player_image || '')
        setEditUrl(player.player_url || '')
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
                        Add players to categories — they show at the end of blog posts
                    </p>
                </div>
            </div>

            {/* Category Selector */}
            <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => { setSelectedCategory(cat.id); setShowAddForm(false); setEditingId(null) }}
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
                <div className="space-y-3">
                    {/* Add Button */}
                    {!showAddForm && (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary/50 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Player to {selectedCat?.name || 'Category'}
                        </button>
                    )}

                    {/* Add Form */}
                    {showAddForm && (
                        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
                            <h3 className="text-sm font-bold flex items-center gap-2">
                                <Plus className="w-4 h-4 text-primary" />
                                Add New Player
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Player Name *</label>
                                    <input
                                        value={newName}
                                        onChange={e => setNewName(e.target.value)}
                                        placeholder="e.g. Virat Kohli"
                                        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Landing Page URL</label>
                                    <input
                                        value={newUrl}
                                        onChange={e => setNewUrl(e.target.value)}
                                        placeholder="e.g. /player/virat-kohli or full URL"
                                        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Player Photo</label>
                                <div className="flex items-center gap-3">
                                    {newImage && (
                                        <img src={newImage} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-border" />
                                    )}
                                    <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card cursor-pointer hover:bg-accent transition-colors text-xs font-medium">
                                        <Upload className="w-3.5 h-3.5" />
                                        {uploading ? 'Uploading...' : 'Upload Photo'}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'new')}
                                        />
                                    </label>
                                    <span className="text-[10px] text-muted-foreground">or paste URL:</span>
                                    <input
                                        value={newImage}
                                        onChange={e => setNewImage(e.target.value)}
                                        placeholder="https://..."
                                        className="flex-1 px-3 py-2 rounded-lg border border-border bg-card text-xs focus:ring-2 focus:ring-primary/30 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => { setShowAddForm(false); setNewName(''); setNewImage(''); setNewUrl('') }}
                                    className="px-4 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:bg-accent transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAdd}
                                    disabled={saving || !newName.trim()}
                                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                    Save Player
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Players Grid */}
                    {players.length === 0 && !showAddForm ? (
                        <div className="py-16 text-center rounded-xl border border-dashed border-border">
                            <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-sm font-semibold">No players in {selectedCat?.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">Add players that will show at the end of blog posts in this category</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {players.map(player => (
                                <div
                                    key={player.id}
                                    className="rounded-xl border border-border bg-card p-3 flex items-center gap-3 group hover:shadow-md transition-shadow"
                                >
                                    {/* Player Photo */}
                                    <div className="w-14 h-14 rounded-full bg-muted border-2 border-border overflow-hidden flex-shrink-0 flex items-center justify-center">
                                        {player.player_image ? (
                                            <img src={player.player_image} alt={player.player_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Users className="w-5 h-5 text-muted-foreground/50" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    {editingId === player.id ? (
                                        <div className="flex-1 space-y-2">
                                            <input
                                                value={editName}
                                                onChange={e => setEditName(e.target.value)}
                                                className="w-full px-2 py-1 text-sm rounded border border-border bg-background"
                                            />
                                            <input
                                                value={editUrl}
                                                onChange={e => setEditUrl(e.target.value)}
                                                placeholder="URL"
                                                className="w-full px-2 py-1 text-xs rounded border border-border bg-background"
                                            />
                                            <div className="flex items-center gap-2">
                                                <label className="text-[10px] text-muted-foreground cursor-pointer flex items-center gap-1">
                                                    <Upload className="w-3 h-3" />
                                                    Photo
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'edit')}
                                                    />
                                                </label>
                                                <button
                                                    onClick={() => handleUpdate(player.id)}
                                                    disabled={saving}
                                                    className="px-2 py-1 rounded bg-primary text-primary-foreground text-[10px] font-bold"
                                                >
                                                    {saving ? '...' : 'Save'}
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="px-2 py-1 rounded border text-[10px] font-bold"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold truncate">{player.player_name}</p>
                                            {player.player_url && (
                                                <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                                                    <LinkIcon className="w-2.5 h-2.5" />
                                                    {player.player_url}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    {editingId !== player.id && (
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => startEdit(player)}
                                                className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                <Edit className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(player.id, player.player_name)}
                                                disabled={deletingId === player.id}
                                                className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                            >
                                                {deletingId === player.id ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
