'use client'

import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import Link from 'next/link'
import {
    FileText, Plus, Eye, Calendar, Edit, Search,
    Loader2, Trash2, Globe, ExternalLink,
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    Upload, Download, X, CheckCircle2, AlertCircle, FileSpreadsheet,
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

interface BulkRow {
    title: string
    slug: string
    page_title?: string
    html_content?: string
    meta_title?: string
    meta_description?: string
    status: string
}

interface BulkProgress {
    total: number
    processed: number
    inserted: number
    skipped: number
    errors: string[]
}

const ITEMS_PER_PAGE = 10
const BATCH_SIZE = 10
const MAX_BULK_PAGES = 100

export function CustomPagesPanel() {
    const { getToken } = useAuth()
    const [pages, setPages] = useState<CustomPage[]>([])
    const [stats, setStats] = useState<PageStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    // Bulk upload state
    const [showBulkModal, setShowBulkModal] = useState(false)
    const [bulkRows, setBulkRows] = useState<BulkRow[]>([])
    const [bulkPublish, setBulkPublish] = useState(false)
    const [bulkUploading, setBulkUploading] = useState(false)
    const [bulkProgress, setBulkProgress] = useState<BulkProgress | null>(null)
    const [bulkFileName, setBulkFileName] = useState('')
    const bulkFileRef = useRef<HTMLInputElement>(null)

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

    // ─── Bulk Upload Logic ───

    function generateSlug(text: string): string {
        return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 80)
    }

    function downloadSampleCSV() {
        const headers = 'title,slug,page_title,html_content,meta_title,meta_description,status'
        const row1 = '"IPL 2024 Schedule","ipl-2024-schedule","IPL 2024 Full Schedule & Match Dates","<h2>IPL Schedule</h2><p>Complete match schedule...</p>","IPL 2024 Schedule - SportsLNV","Check complete IPL 2024 schedule with dates and venues","published"'
        const row2 = '"About Us","about-us","About SportsLNV","<h2>Who We Are</h2><p>SportsLNV is a sports media platform...</p>","About Us - SportsLNV","Learn about SportsLNV","draft"'
        const csv = `${headers}\n${row1}\n${row2}`
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'bulk-pages-sample.csv'
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Sample CSV downloaded!')
    }

    async function handleBulkFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        const ext = file.name.split('.').pop()?.toLowerCase()
        setBulkFileName(file.name)

        try {
            let rows: BulkRow[] = []

            if (ext === 'csv') {
                // Parse CSV natively
                const text = await file.text()
                rows = parseCSV(text)
            } else if (ext === 'xlsx' || ext === 'xls') {
                // Parse Excel with xlsx library
                const XLSX = (await import('xlsx'))
                const arrayBuffer = await file.arrayBuffer()
                const workbook = XLSX.read(arrayBuffer, { type: 'array' })
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
                const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(firstSheet)
                rows = jsonData.map(row => ({
                    title: row.title || row.Title || '',
                    slug: row.slug || row.Slug || generateSlug(row.title || row.Title || ''),
                    page_title: row.page_title || row['Page Title'] || '',
                    html_content: row.html_content || row['HTML Content'] || row.content || '',
                    meta_title: row.meta_title || row['Meta Title'] || '',
                    meta_description: row.meta_description || row['Meta Description'] || '',
                    status: (row.status || row.Status || 'draft').toLowerCase(),
                }))
            } else {
                toast.error('Unsupported file type. Use CSV, XLS, or XLSX.')
                return
            }

            // Filter out empty rows
            rows = rows.filter(r => r.title && r.title.trim())

            if (rows.length === 0) {
                toast.error('No valid rows found in the file')
                return
            }

            if (rows.length > MAX_BULK_PAGES) {
                toast.error(`Maximum ${MAX_BULK_PAGES} pages per upload. Found ${rows.length} rows.`)
                rows = rows.slice(0, MAX_BULK_PAGES)
            }

            // Auto-generate slugs if missing
            rows = rows.map(r => ({
                ...r,
                slug: r.slug || generateSlug(r.title),
            }))

            setBulkRows(rows)
            toast.success(`${rows.length} pages loaded from file`)
        } catch (err) {
            console.error('File parse error:', err)
            toast.error('Failed to parse file. Check the format.')
        }

        // Reset input
        if (bulkFileRef.current) bulkFileRef.current.value = ''
    }

    function parseCSV(text: string): BulkRow[] {
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
        if (lines.length < 2) return []

        const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim())
        const rows: BulkRow[] = []

        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i])
            const row: Record<string, string> = {}
            headers.forEach((h, idx) => {
                row[h] = values[idx] || ''
            })
            rows.push({
                title: row.title || '',
                slug: row.slug || generateSlug(row.title || ''),
                page_title: row.page_title || '',
                html_content: row.html_content || row.content || '',
                meta_title: row.meta_title || '',
                meta_description: row.meta_description || '',
                status: (row.status || 'draft').toLowerCase(),
            })
        }
        return rows
    }

    function parseCSVLine(line: string): string[] {
        const result: string[] = []
        let current = ''
        let inQuotes = false

        for (let i = 0; i < line.length; i++) {
            const char = line[i]
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"'
                    i++
                } else {
                    inQuotes = !inQuotes
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim())
                current = ''
            } else {
                current += char
            }
        }
        result.push(current.trim())
        return result
    }

    async function handleBulkUpload() {
        if (bulkRows.length === 0) return

        const rowsToUpload = bulkRows.map(r => ({
            ...r,
            status: bulkPublish ? 'published' : (r.status === 'published' ? 'published' : 'draft'),
        }))

        setBulkUploading(true)
        const progress: BulkProgress = {
            total: rowsToUpload.length,
            processed: 0,
            inserted: 0,
            skipped: 0,
            errors: [],
        }
        setBulkProgress(progress)

        const token = getToken()

        // Process in batches of BATCH_SIZE
        for (let i = 0; i < rowsToUpload.length; i += BATCH_SIZE) {
            const batch = rowsToUpload.slice(i, i + BATCH_SIZE)

            try {
                const res = await fetch('/api/admin/pages/bulk', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ pages: batch }),
                })

                const result = await res.json()

                if (!res.ok) {
                    progress.errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${result.error}`)
                    progress.skipped += batch.length
                } else {
                    progress.inserted += result.inserted || 0
                    progress.skipped += result.skipped || 0
                    if (result.errors?.length) {
                        progress.errors.push(...result.errors)
                    }
                }
            } catch {
                progress.errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: Network error`)
                progress.skipped += batch.length
            }

            progress.processed += batch.length
            setBulkProgress({ ...progress })

            // Small delay between batches to prevent server overload
            if (i + BATCH_SIZE < rowsToUpload.length) {
                await new Promise(r => setTimeout(r, 300))
            }
        }

        setBulkUploading(false)

        if (progress.inserted > 0) {
            toast.success(`✅ ${progress.inserted} pages uploaded successfully!`)
            fetchPages()
        }
        if (progress.skipped > 0) {
            toast.warning(`⚠️ ${progress.skipped} pages skipped`)
        }
    }

    function closeBulkModal() {
        if (bulkUploading) return
        setShowBulkModal(false)
        setBulkRows([])
        setBulkProgress(null)
        setBulkFileName('')
        setBulkPublish(false)
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
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowBulkModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border border-border hover:bg-accent transition-colors"
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        Bulk Upload
                    </button>
                    <Link
                        href="/admin/pages/new"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
                    >
                        <Plus className="w-4 h-4" />
                        Add New Page
                    </Link>
                </div>
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
                                                /{page.slug}
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
                                                        href={`/${page.slug}`}
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

            {/* ─── Bulk Upload Modal ─── */}
            {showBulkModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={closeBulkModal}>
                    <div
                        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-border">
                            <div>
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <FileSpreadsheet className="w-5 h-5 text-primary" />
                                    Bulk Page Upload
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Upload CSV or Excel file • Max {MAX_BULK_PAGES} pages per upload
                                </p>
                            </div>
                            <button
                                onClick={closeBulkModal}
                                disabled={bulkUploading}
                                className="p-2 rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-5 space-y-5">
                            {/* Step 1: Download Sample */}
                            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                                <h3 className="text-sm font-semibold flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">1</span>
                                    Download Sample Format
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Required columns: <code className="bg-muted px-1 py-0.5 rounded text-[11px]">title</code>, <code className="bg-muted px-1 py-0.5 rounded text-[11px]">slug</code>
                                    <br />
                                    Optional: <code className="bg-muted px-1 py-0.5 rounded text-[11px]">page_title</code>, <code className="bg-muted px-1 py-0.5 rounded text-[11px]">html_content</code>, <code className="bg-muted px-1 py-0.5 rounded text-[11px]">meta_title</code>, <code className="bg-muted px-1 py-0.5 rounded text-[11px]">meta_description</code>, <code className="bg-muted px-1 py-0.5 rounded text-[11px]">status</code> (draft/published)
                                </p>
                                <button
                                    onClick={downloadSampleCSV}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    Download Sample CSV
                                </button>
                            </div>

                            {/* Step 2: Upload File */}
                            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                                <h3 className="text-sm font-semibold flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">2</span>
                                    Upload Your File
                                </h3>
                                <label className="flex flex-col items-center justify-center gap-2 py-6 px-4 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors">
                                    <Upload className="w-6 h-6 text-muted-foreground" />
                                    <span className="text-sm font-medium text-foreground">
                                        {bulkFileName || 'Click to select CSV / XLS / XLSX file'}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                        Supports: .csv, .xls, .xlsx
                                    </span>
                                    <input
                                        ref={bulkFileRef}
                                        type="file"
                                        accept=".csv,.xls,.xlsx"
                                        onChange={handleBulkFileSelect}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            {/* Preview Parsed Rows */}
                            {bulkRows.length > 0 && !bulkProgress && (
                                <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                                    <h3 className="text-sm font-semibold flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">3</span>
                                        Preview ({bulkRows.length} pages)
                                    </h3>

                                    {/* Publish toggle */}
                                    <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-card cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={bulkPublish}
                                            onChange={e => setBulkPublish(e.target.checked)}
                                            className="w-4 h-4 rounded accent-primary"
                                        />
                                        <div>
                                            <span className="text-sm font-medium">Publish all pages immediately</span>
                                            <p className="text-[10px] text-muted-foreground">If unchecked, individual row status will be used (default: draft)</p>
                                        </div>
                                    </label>

                                    {/* Rows preview table */}
                                    <div className="max-h-[200px] overflow-y-auto rounded-lg border border-border">
                                        <table className="w-full text-xs">
                                            <thead className="bg-muted/50 sticky top-0">
                                                <tr>
                                                    <th className="text-left px-3 py-2 font-semibold text-muted-foreground">#</th>
                                                    <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Title</th>
                                                    <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Slug</th>
                                                    <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {bulkRows.map((row, i) => (
                                                    <tr key={i} className="border-t border-border/50">
                                                        <td className="px-3 py-1.5 text-muted-foreground">{i + 1}</td>
                                                        <td className="px-3 py-1.5 font-medium truncate max-w-[200px]">{row.title}</td>
                                                        <td className="px-3 py-1.5 text-muted-foreground font-mono">{row.slug}</td>
                                                        <td className="px-3 py-1.5">
                                                            <span className={cn(
                                                                'px-1.5 py-0.5 rounded text-[10px] font-bold',
                                                                (bulkPublish || row.status === 'published') ? 'bg-emerald-500/15 text-emerald-600' : 'bg-amber-500/15 text-amber-600'
                                                            )}>
                                                                {bulkPublish ? 'Published' : (row.status === 'published' ? 'Published' : 'Draft')}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Upload button */}
                                    <button
                                        onClick={handleBulkUpload}
                                        disabled={bulkUploading}
                                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-50"
                                    >
                                        {bulkUploading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Upload className="w-4 h-4" />
                                        )}
                                        {bulkUploading ? 'Uploading...' : `Upload ${bulkRows.length} Pages`}
                                    </button>
                                </div>
                            )}

                            {/* Progress */}
                            {bulkProgress && (
                                <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                                    <h3 className="text-sm font-semibold flex items-center gap-2">
                                        {bulkUploading ? (
                                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                        ) : (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        )}
                                        {bulkUploading ? 'Uploading...' : 'Upload Complete'}
                                    </h3>

                                    {/* Progress bar */}
                                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className="h-full bg-primary rounded-full transition-all duration-500"
                                            style={{ width: `${(bulkProgress.processed / bulkProgress.total) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {bulkProgress.processed}/{bulkProgress.total} processed
                                    </p>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="rounded-lg bg-emerald-500/10 p-2 text-center">
                                            <p className="text-lg font-bold text-emerald-600">{bulkProgress.inserted}</p>
                                            <p className="text-[10px] text-emerald-600/70">Inserted</p>
                                        </div>
                                        <div className="rounded-lg bg-amber-500/10 p-2 text-center">
                                            <p className="text-lg font-bold text-amber-600">{bulkProgress.skipped}</p>
                                            <p className="text-[10px] text-amber-600/70">Skipped</p>
                                        </div>
                                        <div className="rounded-lg bg-red-500/10 p-2 text-center">
                                            <p className="text-lg font-bold text-red-600">{bulkProgress.errors.length}</p>
                                            <p className="text-[10px] text-red-600/70">Errors</p>
                                        </div>
                                    </div>

                                    {/* Errors list */}
                                    {bulkProgress.errors.length > 0 && (
                                        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 max-h-[120px] overflow-y-auto">
                                            <p className="text-xs font-semibold text-red-600 mb-1 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> Errors:
                                            </p>
                                            {bulkProgress.errors.map((err, i) => (
                                                <p key={i} className="text-[11px] text-red-500/80">{err}</p>
                                            ))}
                                        </div>
                                    )}

                                    {/* Done button */}
                                    {!bulkUploading && (
                                        <button
                                            onClick={closeBulkModal}
                                            className="w-full px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-accent transition-colors"
                                        >
                                            Done
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Info box */}
                            <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-3">
                                <p className="text-[11px] text-blue-600 font-semibold mb-1">📋 Bulk Upload Info</p>
                                <ul className="text-[11px] text-blue-600/80 space-y-0.5">
                                    <li>• Maximum <strong>{MAX_BULK_PAGES} pages</strong> per upload</li>
                                    <li>• Processed in batches of {BATCH_SIZE} for server stability</li>
                                    <li>• Duplicate slugs are automatically skipped</li>
                                    <li>• Slug is auto-generated from title if left empty</li>
                                    <li>• Supported formats: CSV, XLS, XLSX</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
