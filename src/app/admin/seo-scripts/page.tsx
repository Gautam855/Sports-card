'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { toast } from 'sonner'
import {
    Plus, Search, Trash2, Save, Power, PowerOff, Code2, Globe, Tag,
    FileCode, Megaphone, BarChart3, Shield, Braces, ChevronDown, ChevronUp,
    Copy, ExternalLink, AlertTriangle, CheckCircle2, XCircle, Loader2, Filter,
    Upload
} from 'lucide-react'

/* ───────── types ───────── */
interface SiteScript {
    id: string; name: string; slug: string; category: string; script_type: string
    placement: string; content: string; src: string | null; attributes: Record<string, any>
    pages: string[]; exclude_pages: string[]; loading_strategy: string
    priority: number; is_active: boolean; notes: string | null
    created_at: string; updated_at: string
}

const CATEGORIES = [
    { value: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-blue-400' },
    { value: 'ads', label: 'Ads / AdSense', icon: Megaphone, color: 'text-green-400' },
    { value: 'seo-meta', label: 'SEO Meta', icon: Globe, color: 'text-purple-400' },
    { value: 'verification', label: 'Verification', icon: Shield, color: 'text-amber-400' },
    { value: 'structured-data', label: 'Structured Data', icon: Braces, color: 'text-cyan-400' },
    { value: 'tracking', label: 'Tracking', icon: Tag, color: 'text-pink-400' },
    { value: 'custom', label: 'Custom', icon: Code2, color: 'text-gray-400' },
]

const SCRIPT_TYPES = [
    { value: 'script-src', label: 'External Script (src)' },
    { value: 'script-inline', label: 'Inline Script' },
    { value: 'meta', label: 'Meta Tag' },
    { value: 'link', label: 'Link Tag' },
    { value: 'json-ld', label: 'JSON-LD (Structured Data)' },
    { value: 'noscript', label: 'Noscript' },
    { value: 'raw-html', label: 'Raw HTML' },
]

const PLACEMENTS = [
    { value: 'head', label: '<head>' },
    { value: 'body-start', label: '<body> Start' },
    { value: 'body-end', label: '</body> End' },
]

const STRATEGIES = [
    { value: 'beforeInteractive', label: 'Before Interactive' },
    { value: 'afterInteractive', label: 'After Interactive' },
    { value: 'lazyOnload', label: 'Lazy Onload' },
    { value: 'worker', label: 'Worker' },
]

const EMPTY: SiteScript = {
    id: '', name: '', slug: '', category: 'custom', script_type: 'script-inline',
    placement: 'head', content: '', src: null, attributes: {},
    pages: ['*'], exclude_pages: [], loading_strategy: 'afterInteractive',
    priority: 50, is_active: false, notes: null, created_at: '', updated_at: ''
}

export default function SeoScriptsPage() {
    const { getToken } = useAuth()
    const [scripts, setScripts] = useState<SiteScript[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState<string | null>(null)
    const [search, setSearch] = useState('')
    const [catFilter, setCatFilter] = useState<string>('all')
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [showCreate, setShowCreate] = useState(false)
    const [newScript, setNewScript] = useState<SiteScript>({ ...EMPTY })
    const [siteFiles, setSiteFiles] = useState<string[]>([])
    const [uploading, setUploading] = useState(false)

    const headers = useCallback(() => {
        const token = getToken()
        return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    }, [getToken])

    const fetchScripts = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/site-scripts', { headers: headers() })
            const data = await res.json()
            if (data.scripts) setScripts(data.scripts)
        } catch { toast.error('Failed to load scripts') }
        finally { setLoading(false) }
    }, [headers])

    useEffect(() => { fetchScripts() }, [fetchScripts])

    const fetchSiteFiles = useCallback(async () => {
        try {
            const token = getToken()
            const res = await fetch('/api/admin/site-files', {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            })
            const data = await res.json()
            if (data.files) setSiteFiles(data.files)
        } catch {}
    }, [getToken])

    useEffect(() => { fetchSiteFiles() }, [fetchSiteFiles])

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            const token = getToken()
            const res = await fetch('/api/admin/site-files', {
                method: 'POST',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: formData
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            toast.success(`Uploaded: ${data.filename}`)
            fetchSiteFiles()
        } catch (err: any) { toast.error(err.message || 'Upload failed') }
        finally { setUploading(false); e.target.value = '' }
    }

    async function handleFileDelete(filename: string) {
        if (!confirm(`Delete ${filename}?`)) return
        try {
            const token = getToken()
            const res = await fetch(`/api/admin/site-files?filename=${filename}`, {
                method: 'DELETE',
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            })
            if (!res.ok) throw new Error()
            setSiteFiles(prev => prev.filter(f => f !== filename))
            toast.success('Deleted')
        } catch { toast.error('Failed to delete') }
    }

    async function handleToggle(script: SiteScript) {
        setSaving(script.id)
        try {
            const res = await fetch('/api/admin/site-scripts', {
                method: 'PUT', headers: headers(),
                body: JSON.stringify({ id: script.id, is_active: !script.is_active })
            })
            if (!res.ok) throw new Error()
            setScripts(prev => prev.map(s => s.id === script.id ? { ...s, is_active: !s.is_active } : s))
            toast.success(`${script.name} ${!script.is_active ? 'activated' : 'deactivated'}`)
        } catch { toast.error('Failed to toggle') }
        finally { setSaving(null) }
    }

    async function handleSave(script: SiteScript) {
        setSaving(script.id)
        try {
            const res = await fetch('/api/admin/site-scripts', {
                method: 'PUT', headers: headers(),
                body: JSON.stringify(script)
            })
            if (!res.ok) throw new Error()
            const data = await res.json()
            setScripts(prev => prev.map(s => s.id === script.id ? data.script : s))
            toast.success('Saved!')
        } catch { toast.error('Failed to save') }
        finally { setSaving(null) }
    }

    async function handleCreate() {
        if (!newScript.name || !newScript.slug) { toast.error('Name & Slug required'); return }
        setSaving('new')
        try {
            const res = await fetch('/api/admin/site-scripts', {
                method: 'POST', headers: headers(),
                body: JSON.stringify(newScript)
            })
            if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
            const data = await res.json()
            setScripts(prev => [...prev, data.script])
            setNewScript({ ...EMPTY })
            setShowCreate(false)
            toast.success('Script created!')
        } catch (e: any) { toast.error(e.message || 'Failed to create') }
        finally { setSaving(null) }
    }

    async function handleDelete(id: string) {
        if (!confirm('Delete this script permanently?')) return
        setSaving(id)
        try {
            const res = await fetch(`/api/admin/site-scripts?id=${id}`, { method: 'DELETE', headers: headers() })
            if (!res.ok) throw new Error()
            setScripts(prev => prev.filter(s => s.id !== id))
            toast.success('Deleted')
        } catch { toast.error('Failed to delete') }
        finally { setSaving(null) }
    }

    const filtered = scripts.filter(s => {
        if (catFilter !== 'all' && s.category !== catFilter) return false
        if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.slug.toLowerCase().includes(search.toLowerCase())) return false
        return true
    })

    const activeCount = scripts.filter(s => s.is_active).length

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    )

    return (
        <div className="space-y-6 w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-display flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30">
                            <Code2 className="w-6 h-6 text-emerald-400" />
                        </div>
                        SEO & Scripts Manager
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Google Analytics, AdSense, Meta Tags, Custom Scripts — full control
                    </p>
                </div>
                <button onClick={() => setShowCreate(!showCreate)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors">
                    <Plus className="w-4 h-4" /> Add Script
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard label="Total Scripts" value={scripts.length} icon={FileCode} color="blue" />
                <StatCard label="Active" value={activeCount} icon={CheckCircle2} color="green" />
                <StatCard label="Inactive" value={scripts.length - activeCount} icon={XCircle} color="red" />
                <StatCard label="Categories" value={new Set(scripts.map(s => s.category)).size} icon={Filter} color="purple" />
            </div>

            {/* Verification Files */}
            <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/15">
                            <Shield className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">Verification Files</h3>
                            <p className="text-xs text-muted-foreground">Upload HTML/TXT files to public folder (Google Search Console, Bing, etc.)</p>
                        </div>
                    </div>
                    <label className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors ${uploading ? 'bg-muted text-muted-foreground' : 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25'}`}>
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {uploading ? 'Uploading...' : 'Upload File'}
                        <input type="file" accept=".html,.txt,.xml,.json" onChange={handleFileUpload} disabled={uploading} className="hidden" />
                    </label>
                </div>
                {siteFiles.length > 0 ? (
                    <div className="space-y-2">
                        {siteFiles.map(f => (
                            <div key={f} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/30 border border-border">
                                <div className="flex items-center gap-2 min-w-0">
                                    <FileCode className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                    <span className="text-sm font-mono truncate">{f}</span>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <a href={`/${f}`} target="_blank" rel="noopener noreferrer"
                                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                    <button onClick={() => handleFileDelete(f)}
                                        className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground text-center py-3">No verification files uploaded yet</p>
                )}
            </div>

            {/* Create Form */}
            {showCreate && (
                <div className="bg-card border border-border rounded-2xl p-6 space-y-4 animate-in slide-in-from-top-2">
                    <h3 className="font-semibold text-lg">Create New Script / Tag</h3>
                    <ScriptForm script={newScript} onChange={setNewScript} />
                    <div className="flex gap-3 pt-2">
                        <button onClick={handleCreate} disabled={saving === 'new'}
                            className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
                            {saving === 'new' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Create
                        </button>
                        <button onClick={() => setShowCreate(false)}
                            className="px-5 py-2 rounded-xl bg-muted text-muted-foreground font-medium text-sm hover:bg-muted/80">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search scripts..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <FilterBtn active={catFilter === 'all'} onClick={() => setCatFilter('all')}>All</FilterBtn>
                    {CATEGORIES.map(c => (
                        <FilterBtn key={c.value} active={catFilter === c.value} onClick={() => setCatFilter(c.value)}>
                            <c.icon className="w-3.5 h-3.5" /> {c.label}
                        </FilterBtn>
                    ))}
                </div>
            </div>

            {/* Scripts List */}
            <div className="space-y-3">
                {filtered.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                        <Code2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No scripts found</p>
                    </div>
                ) : filtered.map(script => (
                    <ScriptCard key={script.id} script={script}
                        expanded={expandedId === script.id}
                        onToggleExpand={() => setExpandedId(expandedId === script.id ? null : script.id)}
                        onToggleActive={() => handleToggle(script)}
                        onSave={handleSave} onDelete={() => handleDelete(script.id)}
                        saving={saving === script.id} />
                ))}
            </div>
        </div>
    )
}

/* ─── Script Card ─── */
function ScriptCard({ script, expanded, onToggleExpand, onToggleActive, onSave, onDelete, saving }: {
    script: SiteScript; expanded: boolean; onToggleExpand: () => void
    onToggleActive: () => void; onSave: (s: SiteScript) => void; onDelete: () => void; saving: boolean
}) {
    const [edited, setEdited] = useState(script)
    useEffect(() => { setEdited(script) }, [script])

    const cat = CATEGORIES.find(c => c.value === script.category)
    const CatIcon = cat?.icon || Code2
    const hasChanges = JSON.stringify(edited) !== JSON.stringify(script)

    return (
        <div className={`bg-card border rounded-2xl overflow-hidden transition-all ${script.is_active ? 'border-emerald-500/30' : 'border-border'}`}>
            {/* Header row */}
            <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors" onClick={onToggleExpand}>
                <div className={`p-2 rounded-lg ${script.is_active ? 'bg-emerald-500/15' : 'bg-muted/50'}`}>
                    <CatIcon className={`w-4 h-4 ${script.is_active ? 'text-emerald-400' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate">{script.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{script.slug}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                        <span>{SCRIPT_TYPES.find(t => t.value === script.script_type)?.label}</span>
                        <span>•</span>
                        <span>{script.placement}</span>
                        <span>•</span>
                        <span>Priority: {script.priority}</span>
                        {script.pages[0] !== '*' && <><span>•</span><span>{script.pages.length} pages</span></>}
                    </div>
                </div>
                {/* Toggle */}
                <button onClick={e => { e.stopPropagation(); onToggleActive() }} disabled={saving}
                    className={`p-2 rounded-lg transition-colors ${script.is_active ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : script.is_active ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                </button>
                {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>

            {/* Expanded edit */}
            {expanded && (
                <div className="border-t border-border p-5 space-y-4 bg-muted/10">
                    <ScriptForm script={edited} onChange={setEdited} />
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                        <button onClick={onDelete} disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                            <Trash2 className="w-4 h-4" /> Delete
                        </button>
                        <button onClick={() => onSave(edited)} disabled={saving || !hasChanges}
                            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 disabled:opacity-40 transition-colors">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

/* ─── Script Form ─── */
function ScriptForm({ script, onChange }: { script: SiteScript; onChange: (s: SiteScript) => void }) {
    const update = (patch: Partial<SiteScript>) => onChange({ ...script, ...patch })

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Name">
                <input value={script.name} onChange={e => update({ name: e.target.value })}
                    className="input-field" placeholder="Google Analytics" />
            </Field>
            <Field label="Slug (unique key)">
                <input value={script.slug} onChange={e => update({ slug: e.target.value })}
                    className="input-field" placeholder="google-analytics" />
            </Field>
            <Field label="Category">
                <select value={script.category} onChange={e => update({ category: e.target.value })} className="input-field">
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
            </Field>
            <Field label="Script Type">
                <select value={script.script_type} onChange={e => update({ script_type: e.target.value })} className="input-field">
                    {SCRIPT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
            </Field>
            <Field label="Placement">
                <select value={script.placement} onChange={e => update({ placement: e.target.value })} className="input-field">
                    {PLACEMENTS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
            </Field>
            <Field label="Loading Strategy">
                <select value={script.loading_strategy} onChange={e => update({ loading_strategy: e.target.value })} className="input-field">
                    {STRATEGIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
            </Field>
            {(script.script_type === 'script-src') && (
                <Field label="Script URL (src)" span={2}>
                    <input value={script.src || ''} onChange={e => update({ src: e.target.value })}
                        className="input-field font-mono text-xs" placeholder="https://www.googletagmanager.com/gtag/js?id=G-XXXXXX" />
                </Field>
            )}
            <Field label="Content / Code" span={2}>
                <textarea value={script.content} onChange={e => update({ content: e.target.value })}
                    className="input-field font-mono text-xs min-h-[120px] resize-y"
                    placeholder={script.script_type === 'meta' ? 'Meta tag content value' : script.script_type === 'json-ld' ? '{"@context":"https://schema.org",...}' : 'window.dataLayer = window.dataLayer || [];'} />
            </Field>
            <Field label="Attributes (JSON)" span={1}>
                <textarea value={JSON.stringify(script.attributes, null, 2)}
                    onChange={e => { try { update({ attributes: JSON.parse(e.target.value) }) } catch {} }}
                    className="input-field font-mono text-xs min-h-[80px] resize-y"
                    placeholder='{"data-ad-client": "ca-pub-XXXXX"}' />
            </Field>
            <div className="space-y-3">
                <Field label="Priority (0-100, lower = first)">
                    <input type="number" min={0} max={100} value={script.priority}
                        onChange={e => update({ priority: parseInt(e.target.value) || 50 })}
                        className="input-field" />
                </Field>
            </div>
            <Field label="Target Pages (one per line, * = all)" span={1}>
                <textarea value={(script.pages || []).join('\n')}
                    onChange={e => update({ pages: e.target.value.split('\n').filter(Boolean) })}
                    className="input-field font-mono text-xs min-h-[60px] resize-y" placeholder={'*\n/blog/*\n/news/*'} />
            </Field>
            <Field label="Exclude Pages (one per line)" span={1}>
                <textarea value={(script.exclude_pages || []).join('\n')}
                    onChange={e => update({ exclude_pages: e.target.value.split('\n').filter(Boolean) })}
                    className="input-field font-mono text-xs min-h-[60px] resize-y" placeholder="/admin/*" />
            </Field>
            <Field label="Notes" span={2}>
                <input value={script.notes || ''} onChange={e => update({ notes: e.target.value })}
                    className="input-field" placeholder="Internal notes..." />
            </Field>
        </div>
    )
}

/* ─── Helpers ─── */
function Field({ label, span, children }: { label: string; span?: number; children: React.ReactNode }) {
    return (
        <div className={span === 2 ? 'md:col-span-2' : ''}>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
            {children}
        </div>
    )
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
    const colors: Record<string, string> = {
        blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/20 text-blue-400',
        green: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20 text-emerald-400',
        red: 'from-red-500/20 to-red-600/10 border-red-500/20 text-red-400',
        purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/20 text-purple-400',
    }
    return (
        <div className={`rounded-xl border bg-gradient-to-br p-4 ${colors[color]}`}>
            <div className="flex items-center justify-between mb-2">
                <Icon className="w-5 h-5 opacity-70" />
                <span className="text-2xl font-bold">{value}</span>
            </div>
            <p className="text-xs opacity-70">{label}</p>
        </div>
    )
}

function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button onClick={onClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${active ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent'}`}>
            {children}
        </button>
    )
}
