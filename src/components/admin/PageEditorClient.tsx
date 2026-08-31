'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Save, Eye, ArrowLeft, Globe, FileText,
    Loader2, Code2, EyeOff, Search, Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

const schema = z.object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    slug: z.string().min(2).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Lowercase letters, numbers, and hyphens only'),
    html_content: z.string().min(1, 'HTML content is required'),
    meta_title: z.string().max(70, 'Max 70 characters for SEO').optional().or(z.literal('')),
    meta_description: z.string().max(160, 'Max 160 characters for SEO').optional().or(z.literal('')),
    status: z.enum(['draft', 'published']).default('draft'),
})

type FormData = z.infer<typeof schema>

interface PageEditorProps {
    page?: FormData & { id?: string }
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
}

export function PageEditorClient({ page }: PageEditorProps) {
    const router = useRouter()
    const { getToken } = useAuth()
    const [saving, setSaving] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    const [slugEdited, setSlugEdited] = useState(!!page)
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const isEditMode = !!page?.id

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isDirty },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            title: page?.title || '',
            slug: page?.slug || '',
            html_content: page?.html_content || '',
            meta_title: page?.meta_title || '',
            meta_description: page?.meta_description || '',
            status: page?.status || 'draft',
        },
    })

    const watchTitle = watch('title')
    const watchSlug = watch('slug')
    const watchHtml = watch('html_content')
    const watchStatus = watch('status')
    const watchMetaTitle = watch('meta_title')
    const watchMetaDesc = watch('meta_description')

    // Auto-generate slug from title
    useEffect(() => {
        if (!slugEdited && watchTitle) {
            setValue('slug', slugify(watchTitle), { shouldValidate: true })
        }
    }, [watchTitle, slugEdited, setValue])

    // Update iframe preview
    useEffect(() => {
        if (showPreview && iframeRef.current) {
            const doc = iframeRef.current.contentDocument
            if (doc) {
                doc.open()
                doc.write(watchHtml || '<p style="color:#888;text-align:center;padding:40px;font-family:sans-serif;">No HTML content yet...</p>')
                doc.close()
            }
        }
    }, [watchHtml, showPreview])

    const onSubmit = useCallback(async (data: FormData) => {
        setSaving(true)
        try {
            const token = getToken()
            const url = isEditMode ? `/api/admin/pages/${page!.id}` : '/api/admin/pages'
            const method = isEditMode ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            })

            const result = await res.json()

            if (!res.ok) {
                throw new Error(result.error || 'Failed to save page')
            }

            toast.success(isEditMode ? 'Page updated!' : 'Page created!')

            if (!isEditMode && result.page?.id) {
                router.push(`/admin/pages/${result.page.id}`)
            } else {
                router.refresh()
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to save'
            toast.error(message)
        } finally {
            setSaving(false)
        }
    }, [getToken, isEditMode, page, router])

    async function handlePublish() {
        const newStatus = watchStatus === 'published' ? 'draft' : 'published'
        setValue('status', newStatus, { shouldDirty: true })

        // Auto-save on publish
        const data = {
            title: watch('title'),
            slug: watch('slug'),
            html_content: watch('html_content'),
            meta_title: watch('meta_title'),
            meta_description: watch('meta_description'),
            status: newStatus,
        }

        setSaving(true)
        try {
            const token = getToken()
            const url = isEditMode ? `/api/admin/pages/${page!.id}` : '/api/admin/pages'
            const method = isEditMode ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            })

            const result = await res.json()
            if (!res.ok) throw new Error(result.error || 'Failed to save')

            toast.success(newStatus === 'published' ? '🚀 Page published!' : 'Page moved to draft')

            if (!isEditMode && result.page?.id) {
                router.push(`/admin/pages/${result.page.id}`)
            } else {
                router.refresh()
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to save'
            toast.error(message)
            // Revert status
            setValue('status', watchStatus, { shouldDirty: true })
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/pages"
                        className="p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold font-display">
                            {isEditMode ? 'Edit Page' : 'Create New Page'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {isEditMode ? `Editing: ${page?.title}` : 'Build a custom landing page'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-border hover:bg-accent transition-colors"
                    >
                        {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {showPreview ? 'Hide Preview' : 'Preview'}
                    </button>
                    <button
                        type="button"
                        onClick={handlePublish}
                        disabled={saving || (!isEditMode && !watch('title'))}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            watchStatus === 'published'
                                ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border border-amber-500/30'
                                : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/30'
                        } disabled:opacity-50`}
                    >
                        <Globe className="w-4 h-4" />
                        {watchStatus === 'published' ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit(onSubmit)}
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            {/* Status Banner */}
            {isEditMode && (
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                    watchStatus === 'published'
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-700'
                        : 'bg-amber-500/5 border-amber-500/20 text-amber-700'
                }`}>
                    <span className={`w-2 h-2 rounded-full ${
                        watchStatus === 'published' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`} />
                    <span className="text-sm font-medium">
                        {watchStatus === 'published' ? 'This page is live' : 'This page is a draft'}
                    </span>
                    {watchStatus === 'published' && (
                        <Link
                            href={`/${watchSlug}`}
                            target="_blank"
                            className="ml-auto text-xs font-semibold hover:underline flex items-center gap-1"
                        >
                            View live page →
                        </Link>
                    )}
                </div>
            )}

            <div className={`grid gap-6 ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                {/* Editor */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Info */}
                    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                        <h2 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                            <FileText className="w-4 h-4" />
                            Page Details
                        </h2>
                        <div className="space-y-2">
                            <Label htmlFor="title">Page Title *</Label>
                            <Input
                                id="title"
                                placeholder="e.g. IPL 2024 Schedule"
                                {...register('title')}
                            />
                            {errors.title && (
                                <p className="text-xs text-destructive">{errors.title.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slug">URL Slug *</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground whitespace-nowrap">/</span>
                                <Input
                                    id="slug"
                                    placeholder="ipl-2024-schedule"
                                    {...register('slug')}
                                    onChange={e => {
                                        setSlugEdited(true)
                                        setValue('slug', e.target.value, { shouldValidate: true })
                                    }}
                                />
                            </div>
                            {errors.slug && (
                                <p className="text-xs text-destructive">{errors.slug.message}</p>
                            )}
                        </div>
                    </div>

                    {/* HTML Content */}
                    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                        <h2 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                            <Code2 className="w-4 h-4" />
                            HTML Template
                        </h2>
                        <div className="space-y-2">
                            <Label htmlFor="html_content">Page HTML Content *</Label>
                            <Textarea
                                id="html_content"
                                placeholder="<div>&#10;  <h1>Your Landing Page</h1>&#10;  <p>Add your HTML content here...</p>&#10;</div>"
                                {...register('html_content')}
                                className="min-h-[400px] font-mono text-sm leading-relaxed"
                            />
                            {errors.html_content && (
                                <p className="text-xs text-destructive">{errors.html_content.message}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Paste your full HTML template here. It will be rendered inside the page layout.
                                You can include inline styles, CSS classes, images, and any HTML elements.
                            </p>
                        </div>
                    </div>

                    {/* SEO */}
                    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                        <h2 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                            <Search className="w-4 h-4" />
                            SEO Settings
                        </h2>
                        <div className="space-y-2">
                            <Label htmlFor="meta_title">Meta Title</Label>
                            <Input
                                id="meta_title"
                                placeholder="SEO title (max 70 chars)"
                                {...register('meta_title')}
                            />
                            {watchMetaTitle && (
                                <p className={`text-xs ${(watchMetaTitle?.length || 0) > 70 ? 'text-destructive' : 'text-muted-foreground'}`}>
                                    {watchMetaTitle.length}/70 characters
                                </p>
                            )}
                            {errors.meta_title && (
                                <p className="text-xs text-destructive">{errors.meta_title.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="meta_description">Meta Description</Label>
                            <Textarea
                                id="meta_description"
                                placeholder="SEO description (max 160 chars)"
                                rows={3}
                                {...register('meta_description')}
                            />
                            {watchMetaDesc && (
                                <p className={`text-xs ${(watchMetaDesc?.length || 0) > 160 ? 'text-destructive' : 'text-muted-foreground'}`}>
                                    {watchMetaDesc.length}/160 characters
                                </p>
                            )}
                            {errors.meta_description && (
                                <p className="text-xs text-destructive">{errors.meta_description.message}</p>
                            )}
                        </div>

                        {/* SEO Preview */}
                        <div className="rounded-lg bg-muted/50 p-4 space-y-1">
                            <p className="text-xs text-muted-foreground font-semibold mb-2 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" />
                                Google Search Preview
                            </p>
                            <p className="text-blue-600 text-base font-medium truncate">
                                {watchMetaTitle || watchTitle || 'Page Title'}
                            </p>
                            <p className="text-emerald-700 text-xs truncate">
                                {typeof window !== 'undefined' ? window.location.origin : 'https://sportslnv.com'}/{watchSlug || 'page-slug'}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {watchMetaDesc || 'Add a meta description to improve your search engine visibility...'}
                            </p>
                        </div>
                    </div>
                </form>

                {/* Preview Panel */}
                {showPreview && (
                    <div className="rounded-xl border border-border bg-card overflow-hidden sticky top-4 h-fit">
                        <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
                            <Eye className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-semibold">Live Preview</span>
                            <div className="ml-auto flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                            </div>
                        </div>
                        <iframe
                            ref={iframeRef}
                            className="w-full min-h-[600px] bg-white"
                            title="Page Preview"
                            sandbox="allow-same-origin"
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
