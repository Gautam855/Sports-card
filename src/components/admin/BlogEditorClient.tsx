'use client'

import { useState, useRef, useCallback } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    Save, Eye, ArrowLeft, Upload, ImagePlus, X, Clock,
    Search, Globe, FileText, Tag, Sparkles, Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'

const schema = z.object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
    excerpt: z.string().optional().or(z.literal('')),
    content: z.string().min(10, 'Content must be at least 10 characters'),
    cover_image: z.string().optional().or(z.literal('')),
    cover_alt: z.string().optional(),
    meta_title: z.string().max(70, 'Max 70 characters for SEO').optional().or(z.literal('')),
    meta_description: z.string().max(160, 'Max 160 characters for SEO').optional().or(z.literal('')),
    canonical_url: z.string().optional().or(z.literal('')),
    is_breaking: z.boolean().default(false),
    is_featured: z.boolean().default(false),
    is_editor_pick: z.boolean().default(false),
    status: z.enum(['draft', 'published', 'archived']).default('draft'),
    read_time_mins: z.coerce.number().optional(),
})

type FormData = z.infer<typeof schema>

interface BlogEditorProps {
    article?: FormData & { id?: string }
    categories: Array<{ id: string; name: string }>
    categoryId?: string
}

export function BlogEditorClient({ article, categories, categoryId }: BlogEditorProps) {
    const router = useRouter()
    const [selectedCategoryId, setSelectedCategoryId] = useState(categoryId ?? '')
    const [uploading, setUploading] = useState(false)
    const [coverPreview, setCoverPreview] = useState(article?.cover_image || '')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [localCategories, setLocalCategories] = useState(categories)

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: article ?? {
            status: 'draft',
            is_breaking: false,
            is_featured: false,
            is_editor_pick: false,
            content: '',
            title: '',
            slug: '',
            excerpt: '',
            cover_image: '',
        },
    })

    const generateSlug = (title: string) => {
        return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    }

    /** Auto-calculate reading time from content */
    const calcReadTime = useCallback((text: string) => {
        const words = text.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length
        return Math.max(1, Math.ceil(words / 200))
    }, [])

    /** Upload image to Supabase via our API */
    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('folder', 'blog-covers')

            // Send the custom JWT token so the server can verify us
            const token = localStorage.getItem('sp_auth_token')
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            })
            const json = await res.json()

            if (!res.ok) {
                toast.error(json.error || 'Upload failed')
                return
            }

            form.setValue('cover_image', json.url)
            setCoverPreview(json.url)
            toast.success('Cover image uploaded!')
        } catch {
            toast.error('Upload failed. Please try again.')
        } finally {
            setUploading(false)
        }
    }

    const [isPending, setIsPending] = useState(false)

    function removeCoverImage() {
        form.setValue('cover_image', '')
        setCoverPreview('')
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const { user: authUser } = useAuth()

    async function onSubmit(data: FormData) {
        console.log("DEBUG: onSubmit started. Data:", data)
        setIsPending(true)
        try {
            const supabase = createClient()
            
            console.log("DEBUG: Auth user:", authUser ? `Logged in as ${authUser.id}` : "Not logged in")

            // Auto-calc read time if not set
            if (!data.read_time_mins) {
                data.read_time_mins = calcReadTime(data.content)
            }

            // Auto-fill SEO fields if empty
            if (!data.meta_title) data.meta_title = data.title.slice(0, 70)
            if (!data.meta_description) data.meta_description = (data.excerpt || data.title).slice(0, 160)

            const payload = {
                ...data,
                category_id: selectedCategoryId || null,
                author_id: authUser?.id || null,
                published_at: data.status === 'published' ? new Date().toISOString() : null,
            }
            
            console.log("DEBUG: Sending payload to Supabase:", payload)

            let error
            if (article?.id) {
                const res = await supabase.from('news').update(payload).eq('id', article.id)
                error = res.error
            } else {
                const res = await supabase.from('news').insert(payload)
                error = res.error
            }

            if (error) {
                console.error("DEBUG: Supabase error:", error)
                toast.error(error.message)
                // If it's a permission error, give advice
                if (error.code === '42501') {
                    toast.info("This is a permission error. You may need to disable RLS on the 'news' table.")
                }
            } else {
                toast.success(article?.id ? 'Blog updated!' : 'Blog published!')
                router.push('/admin/blogs')
                router.refresh()
            }
        } catch (err: any) {
            console.error("DEBUG: Unhandled error in onSubmit:", err)
            toast.error("An unexpected error occurred: " + err.message)
        } finally {
            setIsPending(false)
        }
    }

    const titleValue = form.watch('title') || ''
    const contentValue = form.watch('content') || ''
    const metaTitleValue = form.watch('meta_title') || ''
    const metaDescValue = form.watch('meta_description') || ''
    const slugValue = form.watch('slug') || ''

    function onError(errors: any) {
        console.error("Form validation failed:", errors)
        const errorFields = Object.keys(errors).join(', ')
        toast.error(`Validation failed for fields: ${errorFields}`)
    }

    async function handleAddCategory() {
        const name = prompt("Enter new category name:")
        if (!name) return
        const slug = generateSlug(name)
        const supabase = createClient()
        const { data, error } = await supabase.from('news_categories').insert({ name, slug, color: '#3b82f6' }).select('id, name').single()
        if (error) { toast.error("Error creating category: " + error.message); return }
        setLocalCategories(prev => [...prev, data])
        setSelectedCategoryId(data.id)
        toast.success("Category added!")
    }



    return (
        <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/blogs"><ArrowLeft className="w-4 h-4" /></Link>
                    </Button>
                    <div>
                        <h1 className="font-display text-2xl font-bold">{article?.id ? 'Edit Blog' : 'Write New Blog'}</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">All fields marked * are required</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {article?.id && (
                        <Button variant="outline" size="sm" asChild>
                            <a href={`/blog/${form.getValues('slug')}`} target="_blank">
                                <Eye className="w-4 h-4 mr-2" /> Preview
                            </a>
                        </Button>
                    )}
                    <Button type="submit" disabled={isPending} className="bg-primary">
                        {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        {isPending ? 'Saving...' : 'Save Blog'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ─── Main Content Column ─── */}
                <div className="lg:col-span-2 space-y-5">

                    {/* Featured Image Upload */}
                    <div className="score-card overflow-hidden">
                        <div className="p-4 border-b border-border bg-muted/30">
                            <h3 className="font-semibold text-sm flex items-center gap-2"><ImagePlus className="w-4 h-4 text-primary" /> Featured Image</h3>
                        </div>
                        <div className="p-5">
                            {coverPreview ? (
                                <div className="relative aspect-video rounded-xl overflow-hidden border border-border group">
                                    <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-sm hover:bg-white/30">
                                            Change
                                        </button>
                                        <button type="button" onClick={removeCoverImage} className="bg-red-500/80 text-white px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-sm hover:bg-red-500">
                                            <X className="w-3 h-3 inline mr-1" /> Remove
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="w-full aspect-video rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-3 transition-all bg-muted/20 hover:bg-muted/40"
                                >
                                    {uploading ? (
                                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                    ) : (
                                        <Upload className="w-8 h-8 text-muted-foreground" />
                                    )}
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-foreground">
                                            {uploading ? 'Uploading...' : 'Click to upload featured image'}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            PNG, JPG, WebP up to 5MB • Recommended: 1200×630px
                                        </p>
                                    </div>
                                </button>
                            )}
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                            <div className="mt-3">
                                <Label htmlFor="cover_alt" className="text-xs">Image Alt Text (SEO)</Label>
                                <Input id="cover_alt" {...form.register('cover_alt')} placeholder="Describe the image for accessibility..." className="mt-1 text-xs" />
                            </div>
                        </div>
                    </div>

                    {/* Title & Slug */}
                    <div className="score-card p-6 space-y-4">
                        <div>
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                {...form.register('title')}
                                placeholder="Write a compelling blog title..."
                                className="mt-1.5 text-lg font-bold"
                                onChange={(e) => {
                                    form.setValue('title', e.target.value)
                                    if (!article?.id) form.setValue('slug', generateSlug(e.target.value))
                                }}
                            />
                            {form.formState.errors.title && (
                                <p className="text-red-400 text-sm mt-1">{form.formState.errors.title.message}</p>
                            )}
                            <p className="text-[10px] text-muted-foreground mt-1">{titleValue.length}/70 characters</p>
                        </div>

                        <div>
                            <Label htmlFor="slug">URL Slug *</Label>
                            <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-xs text-muted-foreground font-mono">/blog/</span>
                                <Input id="slug" {...form.register('slug')} placeholder="your-blog-post-slug" className="font-mono text-sm" />
                            </div>
                            {form.formState.errors.slug && (
                                <p className="text-red-400 text-sm mt-1">{form.formState.errors.slug.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="excerpt">Excerpt / Summary</Label>
                            <Textarea id="excerpt" {...form.register('excerpt')} placeholder="A brief summary that appears in cards and search results..." className="mt-1.5 resize-none" rows={3} />
                            <p className="text-[10px] text-muted-foreground mt-1">This appears on blog cards and in Google search results</p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="score-card p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="content">Content * (HTML/Markdown supported)</Label>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                ~{calcReadTime(contentValue)} min read • {contentValue.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length} words
                            </span>
                        </div>
                        <Textarea
                            id="content"
                            {...form.register('content')}
                            placeholder="<h2>Introduction</h2>&#10;<p>Start writing your blog post here...</p>"
                            className="mt-1.5 min-h-[500px] font-mono text-sm leading-relaxed"
                        />
                        {form.formState.errors.content && (
                            <p className="text-red-400 text-sm mt-1">{form.formState.errors.content.message}</p>
                        )}
                    </div>

                    {/* SEO Section */}
                    <div className="score-card overflow-hidden">
                        <div className="p-4 border-b border-border bg-muted/30">
                            <h3 className="font-semibold text-sm flex items-center gap-2">
                                <Search className="w-4 h-4 text-primary" /> SEO & Social Settings
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Google Preview */}
                            <div className="bg-muted/30 rounded-xl p-4 border border-border">
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2">Google Preview</p>
                                <div className="space-y-1">
                                    <p className="text-blue-600 text-base font-medium line-clamp-1">{metaTitleValue || titleValue || 'Blog Post Title'}</p>
                                    <p className="text-green-700 text-xs font-mono">sportslnv.com/blog/{slugValue || 'your-post-slug'}</p>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{metaDescValue || form.watch('excerpt') || 'Your meta description will appear here...'}</p>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="meta_title">Meta Title</Label>
                                <Input id="meta_title" {...form.register('meta_title')} placeholder={titleValue || 'SEO optimized title...'} className="mt-1.5" />
                                <p className={`text-[10px] mt-1 ${(metaTitleValue.length || 0) > 60 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                                    {metaTitleValue.length || 0}/70 characters • Recommended: 50-60
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="meta_description">Meta Description</Label>
                                <Textarea id="meta_description" {...form.register('meta_description')} placeholder="Compelling description for search engines..." className="mt-1.5 resize-none" rows={3} />
                                <p className={`text-[10px] mt-1 ${(metaDescValue.length || 0) > 155 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                                    {metaDescValue.length || 0}/160 characters • Recommended: 120-155
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="canonical_url" className="flex items-center gap-1.5">
                                    <Globe className="w-3 h-3" /> Canonical URL (optional)
                                </Label>
                                <Input id="canonical_url" {...form.register('canonical_url')} placeholder="https://..." className="mt-1.5 font-mono text-sm" />
                                <p className="text-[10px] text-muted-foreground mt-1">Use only if this content exists elsewhere and you want to indicate the original source</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Sidebar ─── */}
                <div className="space-y-5">

                    {/* Publish Settings */}
                    <div className="score-card overflow-hidden">
                        <div className="p-4 border-b border-border bg-muted/30">
                            <h3 className="font-semibold text-sm flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Publish</h3>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <Label>Status</Label>
                                <Select
                                    defaultValue={form.getValues('status')}
                                    onValueChange={(v) => form.setValue('status', v as any)}
                                >
                                    <SelectTrigger className="mt-1.5">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">📝 Draft</SelectItem>
                                        <SelectItem value="published">🟢 Published</SelectItem>
                                        <SelectItem value="archived">📦 Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="read_time">Reading Time (auto-calculated)</Label>
                                <Input
                                    id="read_time"
                                    type="number"
                                    {...form.register('read_time_mins')}
                                    placeholder={String(calcReadTime(contentValue))}
                                    className="mt-1.5"
                                    min={1}
                                    max={120}
                                />
                                <p className="text-[10px] text-muted-foreground mt-1">Leave empty to auto-calculate from content</p>
                            </div>
                        </div>
                    </div>

                    {/* Classification */}
                    <div className="score-card overflow-hidden">
                        <div className="p-4 border-b border-border bg-muted/30">
                            <h3 className="font-semibold text-sm flex items-center gap-2"><Tag className="w-4 h-4 text-primary" /> Classification</h3>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <div className="flex items-center justify-between">
                                    <Label>Category</Label>
                                    <button type="button" onClick={handleAddCategory} className="text-[10px] font-bold text-primary hover:underline">+ Add New</button>
                                </div>
                                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select category" /></SelectTrigger>
                                    <SelectContent>
                                        {localCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Visibility Flags */}
                    <div className="score-card overflow-hidden">
                        <div className="p-4 border-b border-border bg-muted/30">
                            <h3 className="font-semibold text-sm flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Visibility</h3>
                        </div>
                        <div className="p-5 space-y-3">
                            {[
                                { name: 'is_featured' as const, label: '⭐ Featured Post', desc: 'Show in homepage blog section' },
                                { name: 'is_editor_pick' as const, label: '🏆 Editor\'s Pick', desc: 'Highlighted as top pick' },
                                { name: 'is_breaking' as const, label: '🔴 Breaking', desc: 'Mark as breaking news' },
                            ].map(({ name, label, desc }) => (
                                <div key={name} className="flex items-center justify-between py-1">
                                    <div>
                                        <Label htmlFor={name} className="cursor-pointer text-sm">{label}</Label>
                                        <p className="text-[10px] text-muted-foreground">{desc}</p>
                                    </div>
                                    <Switch
                                        id={name}
                                        checked={form.watch(name)}
                                        onCheckedChange={(v) => form.setValue(name, v)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Tips */}
                    <div className="score-card p-5 bg-primary/5 border-primary/20">
                        <h4 className="font-bold text-sm mb-2 text-primary">✍️ Writing Tips</h4>
                        <ul className="text-[11px] text-muted-foreground space-y-1.5">
                            <li>• Use H2/H3 headings in content for better SEO</li>
                            <li>• Keep paragraphs short (2-3 sentences)</li>
                            <li>• Include relevant images within content</li>
                            <li>• Meta title should be 50-60 characters</li>
                            <li>• Meta description should be 120-155 characters</li>
                            <li>• Add alt text to all images</li>
                        </ul>
                    </div>
                </div>
            </div>
        </form>
    )
}
