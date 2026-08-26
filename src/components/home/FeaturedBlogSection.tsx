import Link from 'next/link'
import { PenLine, Clock, User } from 'lucide-react'
import { getArticleLinkProps } from '@/lib/article-links'
import {
    getCategoryName,
    formatArticleDate,
    getAuthorName,
    getReadTime,
    getCoverImage,
} from '@/lib/home-utils'
import { HomeSectionHeader } from '@/components/home/HomeSectionHeader'
import type { News } from '@/lib/types'

export function FeaturedBlogSection({ featured, blogs }: { featured?: News; blogs?: News[] }) {
    const moreBlogs = blogs?.filter((b) => b.id !== featured?.id).slice(0, 3) ?? []
    if (!featured && !moreBlogs.length) return null

    const featuredImage = featured ? getCoverImage(featured) : undefined

    return (
        <section className="home-section-dark py-12 md:py-14">
            <div className="container-wide">
                <HomeSectionHeader
                    title="Featured Blog"
                    subtitle="Expert analysis, opinions & in-depth stories"
                    icon={PenLine}
                    href="/blog"
                    dark
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {featured && (
                        <Link
                            {...getArticleLinkProps(featured, 'blog')}
                            className="lg:col-span-7 group relative rounded-2xl overflow-hidden min-h-[300px] lg:min-h-[380px] border border-white/10"
                        >
                            {featuredImage ? (
                                <img
                                    src={featuredImage}
                                    alt={featured.title}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-800 to-slate-900" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/20" />
                            <div className="absolute top-4 left-4 flex gap-2">
                                <span className="bg-brand-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                                    Featured
                                </span>
                                <span className="bg-white/15 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                                    {getCategoryName(featured.category)}
                                </span>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                                <h3 className="text-2xl md:text-3xl font-display font-black text-white leading-tight mb-3 group-hover:text-brand-200 transition-colors">
                                    {featured.title}
                                </h3>
                                {featured.excerpt && (
                                    <p className="text-slate-300 text-sm line-clamp-2 mb-4 max-w-lg">{featured.excerpt}</p>
                                )}
                                <div className="flex items-center gap-4 text-xs text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        {getAuthorName(featured.author)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {getReadTime(featured)}
                                    </span>
                                    <span>{formatArticleDate(featured)}</span>
                                </div>
                            </div>
                        </Link>
                    )}

                    <div className={`flex flex-col gap-3 ${featured ? 'lg:col-span-5' : 'lg:col-span-12 lg:grid lg:grid-cols-3 lg:gap-5'}`}>
                        {moreBlogs.map((blog) => {
                            const coverImage = getCoverImage(blog)
                            return (
                                <Link
                                    key={blog.id}
                                    {...getArticleLinkProps(blog, 'blog')}
                                    className="group flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-brand-400/30 transition-all duration-300"
                                >
                                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
                                        {coverImage ? (
                                            <img
                                                src={coverImage}
                                                alt={blog.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-brand-400 font-black text-lg">
                                                {blog.title[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col justify-center min-w-0">
                                        <span className="text-[10px] font-bold text-brand-300 uppercase tracking-wider mb-1">
                                            {getCategoryName(blog.category)}
                                        </span>
                                        <h4 className="font-bold text-sm leading-snug line-clamp-2 text-white group-hover:text-brand-200 transition-colors mb-1.5">
                                            {blog.title}
                                        </h4>
                                        <span className="text-[11px] text-slate-500">{formatArticleDate(blog)}</span>
                                    </div>
                                </Link>
                            )
                        })}

                        <Link
                            href="/blog"
                            className="mt-auto flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/20 text-sm font-bold text-slate-400 hover:text-white hover:border-brand-400/50 hover:bg-white/5 transition-all"
                        >
                            Browse All Blogs →
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
