import type { Metadata } from 'next'
import { getNewsBySlug, getRelatedNews } from '@/lib/api/news'
import { redirect, notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { BlogCard } from '@/components/blog/BlogCard'
import { ShareButtons } from '@/components/blog/ShareButtons'
import { ViewTracker } from '@/components/analytics/ViewTracker'
import { TableOfContents } from '@/components/blog/TableOfContents'
import { Calendar, Clock, Eye, User, ArrowLeft, Tag, ChevronRight } from 'lucide-react'
import { BlogInteraction } from '@/components/blog/BlogInteraction'
import { CommentSection } from '@/components/blog/CommentSection'
import { BlogContent } from '@/components/blog/BlogContent'
import { getComments } from '@/lib/api/comments'

interface Props { params: Promise<{ slug: string }> }

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sportslnv.com'

/** Dynamic SEO metadata */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const article = await getNewsBySlug(slug)

    if (!article) return { title: 'Blog Not Found' }

    const title = article.meta_title || article.title
    const description = article.meta_description || article.excerpt || article.title
    const image = article.cover_image || article.og_image
    const url = `${SITE_URL}/blog/${slug}`

    return {
        title: `${title} | SportsLNV Blog`,
        description,
        keywords: [article.category?.name, 'sports blog', 'analysis'].filter(Boolean).join(', '),
        authors: article.author ? [{ name: article.author.display_name || article.author.username }] : undefined,
        openGraph: {
            title,
            description,
            url,
            type: 'article',
            publishedTime: article.published_at,
            authors: article.author?.display_name ? [article.author.display_name] : undefined,
            images: image ? [{ url: image, width: 1200, height: 630, alt: article.cover_alt || article.title }] : undefined,
            siteName: 'SportsLNV',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: image ? [image] : undefined,
        },
        alternates: {
            canonical: article.canonical_url || url,
        },
    }
}

export default async function BlogDetailPage({ params }: Props) {
    const { slug } = await params
    const article = await getNewsBySlug(slug)

    if (!article) {
        redirect('/blog')
    }

    const related = await getRelatedNews(article.id, article.category_id, 3)
    const comments = await getComments(article.id)
    const postUrl = `${SITE_URL}/blog/${slug}`
    const readTime = article.read_time_mins || 5

    // JSON-LD Structured Data for SEO
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: article.title,
        description: article.excerpt || article.meta_description || article.title,
        image: article.cover_image || undefined,
        datePublished: article.published_at,
        dateModified: article.published_at,
        author: {
            '@type': 'Person',
            name: article.author?.display_name || article.author?.username || 'SportsLNV',
        },
        publisher: {
            '@type': 'Organization',
            name: 'SportsLNV',
            logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
        wordCount: article.content ? article.content.replace(/<[^>]*>/g, '').split(/\s+/).length : undefined,
        articleSection: article.category?.name,
        inLanguage: 'en-US',
    }

    // Breadcrumb JSON-LD
    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
            { '@type': 'ListItem', position: 3, name: article.title, item: postUrl },
        ],
    }

    return (
        <>
            {/* JSON-LD Structured Data */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

            {/* View Tracker */}
            <ViewTracker contentId={article.id} contentType="news" />

            <article className="min-h-screen">
                {/* Hero Section */}
                <header className="relative">
                    {article.cover_image && (
                        <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
                            <Image
                                src={article.cover_image}
                                alt={article.cover_alt || article.title}
                                fill
                                priority
                                className="object-cover"
                                sizes="100vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                        </div>
                    )}

                    <div className={`container-wide relative ${article.cover_image ? '-mt-40 z-10' : 'pt-10'}`}>
                        <div className="max-w-4xl mx-auto">
                            {/* Breadcrumbs */}
                            <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6" aria-label="Breadcrumb">
                                <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                                <ChevronRight className="w-3 h-3" />
                                <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
                                <ChevronRight className="w-3 h-3" />
                                <span className="text-foreground font-medium line-clamp-1">{article.title}</span>
                            </nav>

                            {/* Category Badge */}
                            {article.category && (
                                <span
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4"
                                    style={{ backgroundColor: `${article.category.color}20`, color: article.category.color || 'var(--primary)' }}
                                >
                                    <Tag className="w-3 h-3" />
                                    {article.category.name}
                                </span>
                            )}

                            {/* Title */}
                            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-6">
                                {article.title}
                            </h1>

                            {/* Excerpt */}
                            {article.excerpt && (
                                <p className="text-lg text-muted-foreground leading-relaxed mb-6 max-w-3xl">
                                    {article.excerpt}
                                </p>
                            )}

                            {/* Meta Row */}
                            <div className="flex flex-wrap items-center gap-6 pb-6 border-b border-border">
                                {/* Author */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
                                        {article.author?.avatar_url ? (
                                            <Image src={article.author.avatar_url} alt={article.author.display_name || ''} width={40} height={40} className="object-cover" />
                                        ) : (
                                            <User className="w-5 h-5 text-primary" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">{article.author?.display_name || article.author?.username || 'SportsLNV Expert'}</p>
                                        {article.author?.bio && (
                                            <p className="text-[10px] text-muted-foreground line-clamp-1">{article.author.bio}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {formatDate(article.published_at)}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        {readTime} min read
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Eye className="w-3.5 h-3.5" />
                                        {(article.views || 0).toLocaleString()} views
                                    </span>
                                </div>

                                <div className="ml-auto">
                                    <ShareButtons url={postUrl} title={article.title} description={article.excerpt} />
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Blog Content */}
                <div className="container-wide py-10">
                    <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-10">
                        {/* Sidebar with TOC */}
                        <aside className="w-full md:w-64 flex-shrink-0 md:sticky md:top-24 h-fit hidden md:block">
                            <TableOfContents content={article.content || ''} />
                        </aside>

                        <div className="flex-1">
                            <div className="md:hidden">
                                <TableOfContents content={article.content || ''} />
                            </div>
                            <BlogContent content={article.content || ''} />
                        </div>
                    </div>

                    <div className="max-w-4xl mx-auto px-4 mt-8">
                        <BlogInteraction 
                            articleId={article.id} 
                            initialLikes={article.likes || 0} 
                            commentCount={comments.length} 
                        />
                        <CommentSection articleId={article.id} />
                    </div>
                </div>

                {/* Bottom Share + Tags */}
                <div className="container-wide pb-10">
                    <div className="max-w-4xl mx-auto border-t border-border pt-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-wrap">
                                {article.category && (
                                    <Link
                                        href={`/blog?category=${article.category.slug}`}
                                        className="px-3 py-1 rounded-full text-xs font-bold bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                                    >
                                        #{article.category.name}
                                    </Link>
                                )}

                            </div>
                            <ShareButtons url={postUrl} title={article.title} description={article.excerpt} />
                        </div>
                    </div>
                </div>

                {/* Related Posts */}
                {related.length > 0 && (
                    <section className="bg-muted/30 border-t border-border py-16">
                        <div className="container-wide">
                            <div className="max-w-6xl mx-auto">
                                <h2 className="text-2xl font-black mb-8 flex items-center gap-2">
                                    📖 You Might Also Like
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {related.map((item) => (
                                        <BlogCard key={item.id} blog={item} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </article>
        </>
    )
}
