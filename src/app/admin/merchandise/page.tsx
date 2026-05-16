'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon, Tag, Globe, ExternalLink, ShieldCheck, ShieldX, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface MerchItem {
    id: string
    name: string
    description: string
    sport: string
    category: string
    brand: string
    athlete: string
    image_url: string
    price: number
    currency: string
    featured: boolean
    placements: string[]
    display_order: number
    is_active: boolean
    affiliate_url: string
}

export default function AdminMerchandisePage() {
    const [items, setItems] = useState<MerchItem[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editItem, setEditItem] = useState<Partial<MerchItem> | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Form states
    const [showForm, setShowForm] = useState(false)

    useEffect(() => {
        fetchItems()
    }, [])

    const fetchItems = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/merchandise')
            const data = await res.json()
            setItems(data.items || [])
        } catch (error) {
            console.error('Failed to fetch merchandise', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editItem) return

        try {
            setSaving(true)
            const method = isEditing ? 'PUT' : 'POST'
            const res = await fetch('/api/merchandise', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...editItem,
                    price: Number(editItem.price),
                    display_order: Number(editItem.display_order)
                })
            })

            if (res.ok) {
                setShowForm(false)
                setEditItem(null)
                setIsEditing(false)
                fetchItems()
            } else {
                const data = await res.json()
                alert(data.error || 'Failed to save item')
            }
        } catch (error) {
            console.error('Failed to save merchandise', error)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return

        try {
            const res = await fetch(`/api/merchandise?id=${id}`, { method: 'DELETE' })
            if (res.ok) {
                fetchItems()
            }
        } catch (error) {
            console.error('Failed to delete merchandise', error)
        }
    }

    const handleEdit = (item: MerchItem) => {
        setEditItem(item)
        setIsEditing(true)
        setShowForm(true)
    }

    const handleAddNew = () => {
        setEditItem({
            name: '',
            sport: 'football',
            category: 'jerseys',
            price: 0,
            currency: 'USD',
            is_active: true,
            featured: false,
            placements: ['merchandise'],
            display_order: 0
        })
        setIsEditing(false)
        setShowForm(true)
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file || !editItem) return

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('folder', 'merchandise')

            const res = await fetch('/api/upload', { method: 'POST', body: formData })
            const json = await res.json()

            if (!res.ok) {
                alert(json.error || 'Upload failed')
                return
            }

            setEditItem({ ...editItem, image_url: json.url })
        } catch {
            alert('Upload failed. Please try again.')
        } finally {
            setUploading(false)
        }
    }

    function removeImage() {
        if (!editItem) return
        setEditItem({ ...editItem, image_url: '' })
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-display">Merchandise Store</h1>
                    <p className="text-muted-foreground">Manage products, brands, and dashboard placements.</p>
                </div>
                <Button onClick={handleAddNew} className="gap-2" disabled={showForm}>
                    <Plus className="w-4 h-4" /> Add Product
                </Button>
            </div>

            {showForm && editItem && (
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
                    <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Product Name *</label>
                            <Input
                                required
                                value={editItem.name || ''}
                                onChange={e => setEditItem({ ...editItem, name: e.target.value })}
                                placeholder="e.g. Official Real Madrid Jersey"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Product Image</label>
                            {editItem.image_url ? (
                                <div className="relative aspect-video rounded-xl overflow-hidden border border-border group w-full max-w-[200px]">
                                    <img src={editItem.image_url} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                        <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-white/20 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">
                                            Change
                                        </button>
                                        <button type="button" onClick={removeImage} className="bg-red-500/80 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">
                                            <X className="w-3 h-3 inline mr-1" /> Remove
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="w-full h-24 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-colors"
                                >
                                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5 text-muted-foreground" />}
                                    <span className="text-xs text-muted-foreground">{uploading ? 'Uploading...' : 'Click to upload image'}</span>
                                </button>
                            )}
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Sport</label>
                            <select
                                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
                                value={editItem.sport || 'football'}
                                onChange={e => setEditItem({ ...editItem, sport: e.target.value })}
                            >
                                <option value="football">Football</option>
                                <option value="basketball">Basketball</option>
                                <option value="tennis">Tennis</option>
                                <option value="cricket">Cricket</option>
                                <option value="running">Running</option>
                                <option value="all">All / General</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category</label>
                            <select
                                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
                                value={editItem.category || 'jerseys'}
                                onChange={e => setEditItem({ ...editItem, category: e.target.value })}
                            >
                                <option value="jerseys">Official Jerseys</option>
                                <option value="shoes">Shoes / Footwear</option>
                                <option value="equipment">Equipment (Rackets, Bats, etc)</option>
                                <option value="apparel">Apparel / Training</option>
                                <option value="accessories">Accessories</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Brand (e.g. Nike, Adidas)</label>
                            <Input
                                value={editItem.brand || ''}
                                onChange={e => setEditItem({ ...editItem, brand: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Athlete / Influencer (Optional)</label>
                            <Input
                                value={editItem.athlete || ''}
                                onChange={e => setEditItem({ ...editItem, athlete: e.target.value })}
                                placeholder="e.g. Lionel Messi, Kobe Bryant"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Price</label>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={editItem.price || 0}
                                    onChange={e => setEditItem({ ...editItem, price: parseFloat(e.target.value) })}
                                    className="flex-1"
                                />
                                <select
                                    className="bg-background border border-border rounded-md px-3 py-2 text-sm w-24"
                                    value={editItem.currency || 'USD'}
                                    onChange={e => setEditItem({ ...editItem, currency: e.target.value })}
                                >
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="GBP">GBP</option>
                                    <option value="INR">INR</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Affiliate/Buy URL</label>
                            <Input
                                value={editItem.affiliate_url || ''}
                                onChange={e => setEditItem({ ...editItem, affiliate_url: e.target.value })}
                                placeholder="Link to external store"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Placements (comma separated)</label>
                            <Input
                                value={editItem.placements?.join(', ') || ''}
                                onChange={e => setEditItem({ ...editItem, placements: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                placeholder="homepage, sidebar, article_bottom, store"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Display Order</label>
                            <Input
                                type="number"
                                value={editItem.display_order || 0}
                                onChange={e => setEditItem({ ...editItem, display_order: parseInt(e.target.value) })}
                            />
                        </div>

                        <div className="col-span-full flex items-center gap-6 mt-2">
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={editItem.is_active || false}
                                    onChange={e => setEditItem({ ...editItem, is_active: e.target.checked })}
                                    className="rounded border-border text-brand-500 focus:ring-brand-500"
                                />
                                Active (Visible on site)
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={editItem.featured || false}
                                    onChange={e => setEditItem({ ...editItem, featured: e.target.checked })}
                                    className="rounded border-border text-brand-500 focus:ring-brand-500"
                                />
                                Featured (Highlights on dashboard)
                            </label>
                        </div>

                        <div className="col-span-full flex justify-end gap-3 mt-4 pt-4 border-t border-border">
                            <Button variant="outline" onClick={() => { setShowForm(false); setEditItem(null) }} type="button">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={saving}>
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Product'}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed border-border">
                    <Tag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-lg font-bold">No merchandise yet</h3>
                    <p className="text-muted-foreground text-sm mt-1 mb-4">Add your first product to start monetizing.</p>
                    <Button onClick={handleAddNew} variant="outline">Add Product</Button>
                </div>
            ) : (
                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Product</th>
                                    <th className="px-6 py-4 font-semibold">Sport/Category</th>
                                    <th className="px-6 py-4 font-semibold">Price</th>
                                    <th className="px-6 py-4 font-semibold">Status/Placements</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {items.map(item => (
                                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {item.image_url ? (
                                                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ImageIcon className="w-4 h-4 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-foreground">{item.name}</div>
                                                    <div className="text-xs text-muted-foreground mt-0.5">
                                                        {item.brand && <span className="mr-2">By {item.brand}</span>}
                                                        {item.athlete && <span className="text-brand-500">★ {item.athlete}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <Badge variant="outline" className="w-fit capitalize">{item.sport}</Badge>
                                                <span className="text-xs text-muted-foreground capitalize">{item.category}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            {item.price} {item.currency}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    {item.is_active ? (
                                                        <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20 gap-1"><ShieldCheck className="w-3 h-3" /> Active</Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="gap-1"><ShieldX className="w-3 h-3" /> Inactive</Badge>
                                                    )}
                                                    {item.featured && <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20">Featured</Badge>}
                                                </div>
                                                <div className="text-xs text-muted-foreground flex flex-wrap gap-1">
                                                    {item.placements?.map(p => (
                                                        <span key={p} className="bg-muted px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">{p}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {item.affiliate_url && (
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" asChild>
                                                        <a href={item.affiliate_url} target="_blank" rel="noopener noreferrer">
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10" onClick={() => handleEdit(item)}>
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => handleDelete(item.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
