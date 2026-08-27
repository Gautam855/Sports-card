import type { Metadata } from 'next'
import { getNews } from '@/lib/api/news'
import { createClient } from '@/lib/supabase/server'
import { BlogCard } from '@/components/blog/BlogCard'
import { Pagination } from '@/components/ui/Pagination'
import { PenTool, Sparkles, Filter } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
    title: 'Blog — Expert Sports Analysis & Opinions | SportsLNV',
    description: 'Read in-depth sports analysis, expert opinions, match previews, and behind-the-scenes stories from the world of cricket, football, basketball, and more.',
    openGraph: {
        title: 'SportsLNV Blog — Expert Sports Analysis',
        description: 'In-depth sports analysis, expert opinions, and the latest stories from the sports world.',
    },
}

export const revalidate = 60

const PAGE_SIZE = 12

interface BlogListingPageProps {
    searchParams: Promise<{
        category?: string
        page?: string
    }>
}

export default async function BlogListingPage({ searchParams }: BlogListingPageProps) {
    const params = await searchParams
    const categorySlug = params.category
    const currentPage = Math.max(1, parseInt(params.page || '1', 10) || 1)

    const supabase = await createClient()

    // Fetch categories
    const categoriesRes = await supabase
        .from('news_categories')
        .select('id, name, slug, color')
        .order('sort_order')
    const categories = categoriesRes.data ?? []

    // Match category if specified in query
    const selectedCategory = categorySlug
        ? categories.find((c) => c.slug.toLowerCase() === categorySlug.toLowerCase())
        : undefined

    const categoryId = selectedCategory ? selectedCategory.id : (categorySlug ? 'not-found' : undefined)

    // Fetch blogs (published news articles) with pagination & category filter
    const blogsRes = categoryId === 'not-found'
        ? { data: [], count: 0, page: currentPage, limit: PAGE_SIZE, total_pages: 0 }
        : await getNews(
            categoryId ? { category: categoryId } : {},
            { page: currentPage, limit: PAGE_SIZE, sort: 'published_at', order: 'desc' }
        )

    const blogs = blogsRes.data
    const totalPages = blogsRes.total_pages
    const totalCount = blogsRes.count

    // JSON-LD for Blog listing
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: selectedCategory ? `${selectedCategory.name} - SportsLNV Blog` : 'SportsLNV Blog',
        description: 'Expert sports analysis, opinions, and stories.',
        url: 'https://sportslnv.com/blog',
        publisher: {
            '@type': 'Organization',
            name: 'SportsLNV',
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
                            Sports<span className="text-primary">LNV</span> Blog
                        </h1>
                        <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
                            {selectedCategory
                                ? `In-depth analysis and expert opinions for ${selectedCategory.name}.`
                                : 'In-depth analysis, expert opinions, match previews, and behind-the-scenes stories from the world of sports.'}
                        </p>
                    </div>
                </div>
            </section>

            {/* Category Filter Bar */}
            <section className="border-b border-border bg-card/50 sticky top-[64px] z-30 backdrop-blur-lg">
                <div className="container-wide py-3 flex items-center gap-2.5 overflow-x-auto scrollbar-hide">
                    <Link
                        href="/blog"
                        className={cn(
                            'px-4 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0',
                            !categorySlug
                                ? 'bg-primary text-white shadow-md shadow-primary/25'
                                : 'bg-muted hover:bg-primary/10 hover:text-primary text-muted-foreground'
                        )}
                    >
                        All Posts
                    </Link>
                    {categories.map((cat) => {
                        const isActive = categorySlug?.toLowerCase() === cat.slug.toLowerCase()
                        return (
                            <Link
                                key={cat.id}
                                href={`/blog?category=${cat.slug}`}
                                className={cn(
                                    'px-4 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0',
                                    isActive
                                        ? 'bg-primary text-white shadow-md shadow-primary/25'
                                        : 'bg-muted hover:bg-primary/10 hover:text-primary text-muted-foreground'
                                )}
                            >
                                {cat.name}
                            </Link>
                        )
                    })}
                </div>
            </section>

            {/* Blog Grid & Pagination */}
            <section className="container-wide py-12">
                {blogs.length > 0 ? (
                    <div className="space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {blogs.map((blog) => (
                                <BlogCard key={blog.id} blog={blog} />
                            ))}
                        </div>

                        {/* Pagination Component */}
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalCount={totalCount}
                            limit={PAGE_SIZE}
                            baseUrl="/blog"
                            searchParams={{
                                ...(categorySlug ? { category: categorySlug } : {}),
                            }}
                            showSummary={true}
                        />
                    </div>
                ) : (
                    <div className="text-center py-24 bg-card/40 rounded-3xl border border-border/50 max-w-2xl mx-auto my-8">
                        <PenTool className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-40" />
                        <h2 className="text-2xl font-bold mb-2">
                            {selectedCategory ? `No articles in ${selectedCategory.name} yet` : 'No blogs yet'}
                        </h2>
                        <p className="text-muted-foreground mb-6 text-sm max-w-md mx-auto">
                            {selectedCategory
                                ? 'We haven\'t published any articles in this category yet. Check back soon or explore other sports!'
                                : 'Check back soon for expert sports analysis and opinions.'}
                        </p>
                        {categorySlug && (
                            <Link
                                href="/blog"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                            >
                                View All Posts
                            </Link>
                        )}
                    </div>
                )}
            </section>
        </>
    )
}
