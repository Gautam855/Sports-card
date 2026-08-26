import Link from 'next/link'
import { BookOpen } from 'lucide-react'
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

export function LatestBlogsGrid({ blogs }: { blogs: News[] }) {
    const items = blogs.slice(0, 4)
    if (!items.length) return null

    return (
        <section className="home-section">
            <HomeSectionHeader
                title="Latest Blogs"
                subtitle="Read the newest stories from our editors"
                icon={BookOpen}
                href="/blog"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {items.map((blog) => {
                    const coverImage = getCoverImage(blog)
                    return (
                        <Link
                            key={blog.id}
                            {...getArticleLinkProps(blog, 'blog')}
                            className="group flex flex-col rounded-2xl overflow-hidden bg-white border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-brand-200 transition-all duration-300"
                        >
                            <div className="relative aspect-[16/10] overflow-hidden bg-slate-200">
                                {coverImage ? (
                                    <img
                                        src={coverImage}
                                        alt={blog.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-100 to-slate-200">
                                        <span className="text-4xl font-black text-brand-300">{blog.title[0]}</span>
                                    </div>
                                )}
                                <div className="absolute top-3 left-3">
                                    <span
                                        className="text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md backdrop-blur-sm"
                                        style={{
                                            backgroundColor:
                                                typeof blog.category === 'object' && blog.category?.color
                                                    ? blog.category.color + 'cc'
                                                    : '#2563ebcc',
                                        }}
                                    >
                                        {getCategoryName(blog.category)}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4 flex flex-col flex-1">
                                <h3 className="font-bold text-sm leading-snug line-clamp-2 text-slate-900 group-hover:text-brand-700 transition-colors mb-2 flex-1">
                                    {blog.title}
                                </h3>
                                {blog.excerpt && (
                                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">{blog.excerpt}</p>
                                )}
                                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                                    <span className="font-medium text-slate-700">{getAuthorName(blog.author)}</span>
                                    <span>{getReadTime(blog)}</span>
                                </div>
                                <span className="text-[10px] text-slate-400 mt-1">{formatArticleDate(blog)}</span>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </section>
    )
}
