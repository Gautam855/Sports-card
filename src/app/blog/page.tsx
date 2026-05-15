import type { Metadata } from 'next'
import { getNews } from '@/lib/api/news'
import { createClient } from '@/lib/supabase/server'
import { BlogCard } from '@/components/blog/BlogCard'
import { PenTool, Search, Sparkles, Filter } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Blog — Expert Sports Analysis & Opinions | SportsPulse',
    description: 'Read in-depth sports analysis, expert opinions, match previews, and behind-the-scenes stories from the world of cricket, football, basketball, and more.',
    openGraph: {
        title: 'SportsPulse Blog — Expert Sports Analysis',
        description: 'In-depth sports analysis, expert opinions, and the latest stories from the sports world.',
    },
}

export const revalidate = 60

export default async function BlogListingPage() {
    const supabase = await createClient()

    // Fetch blogs (published news articles) and categories
    const [blogsRes, categoriesRes] = await Promise.all([
        getNews({}, { limit: 12, sort: 'published_at', order: 'desc' }),
        supabase.from('news_categories').select('id, name, slug, color').order('sort_order'),
    ])

    const blogs = blogsRes.data
    const categories = categoriesRes.data ?? []

    // JSON-LD for Blog listing
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'SportsPulse Blog',
        description: 'Expert sports analysis, opinions, and stories.',
        url: 'https://sportspulse.com/blog',
        publisher: {
            '@type': 'Organization',
            name: 'SportsPulse',
        },
    }

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            {/* Hero */}
            <section className="relative bg-gradient-to-b from-slate-900 via-slate-900/95 to-background border-b border-border overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]" />
                </div>
                <div className="container-wide relative z-10 py-16 md:py-24">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-[0.25em] mb-4">
                            <Sparkles className="w-4 h-4" />
                            <span>Expert Analysis & Opinions</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4">
                            Sports<span className="text-primary">Pulse</span> Blog
                        </h1>
                        <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
                            In-depth analysis, expert opinions, match previews, and behind-the-scenes stories from the world of sports.
                        </p>
                    </div>
                </div>
            </section>

            {/* Category Filter Bar */}
            <section className="border-b border-border bg-card/50 sticky top-[64px] z-30 backdrop-blur-lg">
                <div className="container-wide py-3 flex items-center gap-3 overflow-x-auto scrollbar-hide">
                    <Link
                        href="/blog"
                        className="px-4 py-1.5 rounded-full text-xs font-bold bg-primary text-white flex-shrink-0"
                    >
                        All Posts
                    </Link>
                    {categories.map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/blog?category=${cat.slug}`}
                            className="px-4 py-1.5 rounded-full text-xs font-bold bg-muted hover:bg-primary/10 hover:text-primary transition-colors flex-shrink-0"
                        >
                            {cat.name}
                        </Link>
                    ))}
                </div>
            </section>

            {/* Blog Grid */}
            <section className="container-wide py-12">
                {blogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogs.map((blog) => (
                            <BlogCard key={blog.id} blog={blog} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24">
                        <PenTool className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">No blogs yet</h2>
                        <p className="text-muted-foreground mb-6">Check back soon for expert sports analysis and opinions.</p>
                    </div>
                )}
            </section>
        </>
    )
}
