import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PenTool, Plus, Eye, Calendar, Edit, Trash2, FileText } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { DeleteBlogButton } from '@/components/admin/DeleteBlogButton'

export default async function AdminBlogsPage() {
    const supabase = await createClient()

    // Fetch all news articles (blogs) with counts
    const [blogsRes, statsRes] = await Promise.all([
        supabase
            .from('news')
            .select(`
                id, title, slug, cover_image, status, views, published_at, created_at,
                author:profiles(display_name, username),
                category:news_categories(name)
            `)
            .order('created_at', { ascending: false })
            .limit(50),
        supabase
            .from('news')
            .select('id, views, status', { count: 'exact' }),
    ])

    const blogs = blogsRes.data ?? []
    const totalBlogs = statsRes.count ?? 0
    const totalViews = (statsRes.data ?? []).reduce((sum: number, b: any) => sum + (b.views || 0), 0)
    const publishedCount = (statsRes.data ?? []).filter((b: any) => b.status === 'published').length
    const draftCount = (statsRes.data ?? []).filter((b: any) => b.status === 'draft').length

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-display flex items-center gap-3">
                        <PenTool className="w-8 h-8 text-primary" />
                        Blog Management
                    </h1>
                    <p className="text-muted-foreground mt-1">Create, edit and manage your expert sports blogs.</p>
                </div>
                <Link
                    href="/admin/blogs/new"
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 w-fit"
                >
                    <Plus className="w-5 h-5" />
                    Write New Blog
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Blogs" value={totalBlogs} icon={FileText} color="text-blue-500 bg-blue-500/10" />
                <StatCard label="Published" value={publishedCount} icon={PenTool} color="text-emerald-500 bg-emerald-500/10" />
                <StatCard label="Drafts" value={draftCount} icon={Edit} color="text-amber-500 bg-amber-500/10" />
                <StatCard label="Total Views" value={totalViews.toLocaleString()} icon={Eye} color="text-primary bg-primary/10" />
            </div>

            {/* Blog List */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-border bg-muted/30 flex items-center justify-between">
                    <h3 className="font-bold text-lg">All Blog Posts</h3>
                    <span className="text-xs text-muted-foreground">{blogs.length} articles</span>
                </div>

                {blogs.length === 0 ? (
                    <div className="p-12 text-center">
                        <PenTool className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-lg font-bold mb-1">No blog posts yet</p>
                        <p className="text-sm text-muted-foreground mb-4">Start writing your first blog post!</p>
                        <Link href="/admin/blogs/new" className="text-primary font-bold text-sm hover:underline">
                            Write New Blog →
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {blogs.map((blog: any) => (
                            <div key={blog.id} className="p-5 flex items-center justify-between hover:bg-accent/50 transition-colors gap-4">
                                <div className="flex items-center gap-4 min-w-0 flex-1">
                                    <div className="w-20 h-14 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                                        {blog.cover_image ? (
                                            <img src={blog.cover_image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-blue-500/10">
                                                <FileText className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-bold text-sm line-clamp-1">{blog.title}</h4>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {blog.published_at ? formatDate(blog.published_at) : formatDate(blog.created_at)}
                                            </span>
                                            <StatusBadge status={blog.status} />
                                            {blog.category && (
                                                <span className="bg-muted px-1.5 py-0.5 rounded text-[10px]">{blog.category.name}</span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Eye className="w-3 h-3" /> {(blog.views || 0).toLocaleString()} views
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <Link
                                        href={`/blog/${blog.slug}`}
                                        target="_blank"
                                        className="px-3 py-1.5 text-xs font-bold bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
                                    >
                                        <Eye className="w-3 h-3 inline mr-1" />View
                                    </Link>
                                    <Link
                                        href={`/admin/blogs/${blog.id}/edit`}
                                        className="px-3 py-1.5 text-xs font-bold bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-all"
                                    >
                                        <Edit className="w-3 h-3 inline mr-1" />Edit
                                    </Link>
                                    <DeleteBlogButton id={blog.id} title={blog.title} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function StatCard({ label, value, icon: Icon, color }: any) {
    const [textColor, bgColor] = color.split(' ')
    return (
        <div className="bg-card border border-border p-5 rounded-2xl flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bgColor}`}>
                <Icon className={`w-5 h-5 ${textColor}`} />
            </div>
            <div>
                <p className="text-xs text-muted-foreground font-medium">{label}</p>
                <p className="text-xl font-bold mt-0.5">{value}</p>
            </div>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, string> = {
        published: 'bg-emerald-500/10 text-emerald-500',
        draft: 'bg-amber-500/10 text-amber-500',
        archived: 'bg-zinc-500/10 text-zinc-500',
    }
    return (
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${config[status] || config.draft}`}>
            {status}
        </span>
    )
}
