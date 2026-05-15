'use client'

import { useState, useTransition } from 'react'
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
import { Save, Eye, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

const schema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    slug: z.string().min(3).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
    excerpt: z.string().optional(),
    content: z.string().min(50, 'Content must be at least 50 characters'),
    cover_image: z.string().url().optional().or(z.literal('')),
    cover_alt: z.string().optional(),
    meta_title: z.string().optional(),
    meta_description: z.string().max(160).optional(),
    is_breaking: z.boolean().default(false),
    is_featured: z.boolean().default(false),
    is_editor_pick: z.boolean().default(false),
    status: z.enum(['draft', 'published', 'archived']).default('draft'),
    read_time_mins: z.coerce.number().optional(),
})

type FormData = z.infer<typeof schema>

interface NewsEditorClientProps {
    article?: FormData & { id?: string }
    categories: Array<{ id: string; name: string }>
    sports: Array<{ id: string; name: string }>
    categoryId?: string
    sportId?: string
    redirectPath?: string
}

export function NewsEditorClient({ article, categories, sports, categoryId, sportId, redirectPath = '/admin/news' }: NewsEditorClientProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [selectedCategoryId, setSelectedCategoryId] = useState(categoryId ?? '')
    const [selectedSportId, setSelectedSportId] = useState(sportId ?? '')

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: article ?? { status: 'draft', is_breaking: false, is_featured: false, is_editor_pick: false },
    })

    const generateSlug = (title: string) => {
        return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    }

    async function onSubmit(data: FormData) {
        startTransition(async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { toast.error('Not authenticated'); return }

            const payload = {
                ...data,
                category_id: selectedCategoryId || null,
                sport_id: selectedSportId || null,
                author_id: user.id,
                published_at: data.status === 'published' ? new Date().toISOString() : null,
            }

            let error
            if (article?.id) {
                const res = await supabase.from('news').update(payload).eq('id', article.id)
                error = res.error
            } else {
                const res = await supabase.from('news').insert(payload)
                error = res.error
            }

            if (error) {
                toast.error(error.message)
            } else {
                toast.success(article?.id ? 'Article updated!' : 'Article created!')
                router.push(redirectPath)
                router.refresh()

            }
        })
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/news"><ArrowLeft className="w-4 h-4" /></Link>
                    </Button>
                    <div>
                        <h1 className="font-display text-2xl font-bold">{article?.id ? 'Edit Article' : 'New Article'}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {article?.id && (
                        <Button variant="outline" size="sm" asChild>
                            <a href={`/news/${form.getValues('slug')}`} target="_blank">
                                <Eye className="w-4 h-4 mr-2" /> Preview
                            </a>
                        </Button>
                    )}
                    <Button type="submit" disabled={isPending}>
                        <Save className="w-4 h-4 mr-2" />
                        {isPending ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Fields */}
                <div className="lg:col-span-2 space-y-5">
                    <div className="score-card p-6 space-y-4">
                        <div>
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                {...form.register('title')}
                                placeholder="Article title..."
                                className="mt-1.5"
                                onChange={(e) => {
                                    form.setValue('title', e.target.value)
                                    if (!article?.id) form.setValue('slug', generateSlug(e.target.value))
                                }}
                            />
                            {form.formState.errors.title && (
                                <p className="text-red-400 text-sm mt-1">{form.formState.errors.title.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="slug">Slug *</Label>
                            <Input id="slug" {...form.register('slug')} placeholder="article-slug" className="mt-1.5 font-mono text-sm" />
                            {form.formState.errors.slug && (
                                <p className="text-red-400 text-sm mt-1">{form.formState.errors.slug.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="excerpt">Excerpt</Label>
                            <Textarea id="excerpt" {...form.register('excerpt')} placeholder="Brief summary..." className="mt-1.5 resize-none" rows={3} />
                        </div>

                        <div>
                            <Label htmlFor="content">Content * (HTML supported)</Label>
                            <Textarea
                                id="content"
                                {...form.register('content')}
                                placeholder="<p>Article content...</p>"
                                className="mt-1.5 min-h-[400px] font-mono text-sm"
                            />
                            {form.formState.errors.content && (
                                <p className="text-red-400 text-sm mt-1">{form.formState.errors.content.message}</p>
                            )}
                        </div>
                    </div>

                    {/* SEO */}
                    <div className="score-card p-6 space-y-4">
                        <h3 className="font-semibold">SEO</h3>
                        <div>
                            <Label htmlFor="meta_title">Meta Title</Label>
                            <Input id="meta_title" {...form.register('meta_title')} className="mt-1.5" />
                        </div>
                        <div>
                            <Label htmlFor="meta_description">Meta Description (max 160 chars)</Label>
                            <Textarea id="meta_description" {...form.register('meta_description')} className="mt-1.5 resize-none" rows={3} />
                        </div>
                    </div>
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-5">
                    {/* Publish */}
                    <div className="score-card p-5 space-y-4">
                        <h3 className="font-semibold">Publish</h3>
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
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="read_time">Read Time (minutes)</Label>
                            <Input id="read_time" type="number" {...form.register('read_time_mins')} className="mt-1.5" min={1} max={60} />
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="score-card p-5 space-y-4">
                        <h3 className="font-semibold">Classification</h3>
                        <div>
                            <Label>Category</Label>
                            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select category" /></SelectTrigger>
                                <SelectContent>
                                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Sport</Label>
                            <Select value={selectedSportId} onValueChange={setSelectedSportId}>
                                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select sport" /></SelectTrigger>
                                <SelectContent>
                                    {sports.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Media */}
                    <div className="score-card p-5 space-y-4">
                        <h3 className="font-semibold">Media</h3>
                        <div>
                            <Label htmlFor="cover_image">Cover Image URL</Label>
                            <Input id="cover_image" {...form.register('cover_image')} placeholder="https://..." className="mt-1.5" />
                        </div>
                        <div>
                            <Label htmlFor="cover_alt">Alt Text</Label>
                            <Input id="cover_alt" {...form.register('cover_alt')} className="mt-1.5" />
                        </div>
                    </div>

                    {/* Flags */}
                    <div className="score-card p-5 space-y-3">
                        <h3 className="font-semibold">Visibility Flags</h3>
                        {[
                            { name: 'is_breaking' as const, label: 'Breaking News' },
                            { name: 'is_featured' as const, label: 'Featured Article' },
                            { name: 'is_editor_pick' as const, label: "Editor's Pick" },
                        ].map(({ name, label }) => (
                            <div key={name} className="flex items-center justify-between">
                                <Label htmlFor={name} className="cursor-pointer">{label}</Label>
                                <Switch
                                    id={name}
                                    checked={form.watch(name)}
                                    onCheckedChange={(v) => form.setValue(name, v)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </form>
    )
}