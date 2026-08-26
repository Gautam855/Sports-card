import Link from 'next/link'
import { ArrowRight, Calendar, Clock, Eye, PenLine, Sparkles } from 'lucide-react'
import { getArticleLinkProps } from '@/lib/article-links'
import {
    getCategoryName,
    getCategoryColor,
    formatArticleDateUpper,
    getAuthorName,
    getAuthorAvatar,
    getAuthorInitial,
    getReadTimeShort,
    getCoverImage,
} from '@/lib/home-utils'
import type { News } from '@/lib/types'

export function LatestFromBlogSection({ blogs }: { blogs?: News[] }) {
    const items = blogs?.slice(0, 6) ?? []
    if (!items.length) return null

    return (
        <section className="bg-slate-900 text-white">
            <div className="container-wide py-10 md:py-14">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-10">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-red-500" />
                            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-red-500">
                                Expert Analysis
                            </span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
                            Latest From Our{' '}
                            <span className="text-red-500 italic font-serif">Blog</span>
                        </h2>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            In-depth sports analysis, expert opinions, and behind-the-scenes stories — fresh from our editorial team.
                        </p>
                    </div>
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors flex-shrink-0 shadow-lg shadow-red-600/20"
                    >
                        Explore All Articles
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                    {items.map((blog) => {
                        const coverImage = getCoverImage(blog)
                        const views = blog.views ?? 0
                        const categoryColor = getCategoryColor(blog.category)
                        const avatarUrl = getAuthorAvatar(blog.author)

                        return (
                            <article
                                key={blog.id}
                                className="group flex flex-col rounded-2xl overflow-hidden bg-slate-800/50 border border-slate-700/60 hover:border-red-500/40 hover:shadow-xl hover:shadow-red-900/10 transition-all duration-300"
                            >
                                <Link
                                    {...getArticleLinkProps(blog, 'blog')}
                                    className="relative block aspect-[16/10] overflow-hidden bg-slate-800"
                                >
                                    {coverImage ? (
                                        <img
                                            src={coverImage}
                                            alt={blog.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                                            <PenLine className="w-12 h-12 text-slate-700" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute top-3 left-3 flex items-center gap-2">
                                        <span
                                            className="text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded"
                                            style={{ backgroundColor: `${categoryColor}e6` }}
                                        >
                                            {getCategoryName(blog.category)}
                                        </span>
                                        {blog.is_featured && (
                                            <span className="bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded">
                                                Featured
                                            </span>
                                        )}
                                    </div>
                                </Link>

                                <div className="p-5 flex flex-col flex-1 min-w-0">
                                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3 text-red-500/70" />
                                            {formatArticleDateUpper(blog)}
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-slate-600" />
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3 text-red-500/70" />
                                            {getReadTimeShort(blog)}
                                        </span>
                                    </div>

                                    <Link {...getArticleLinkProps(blog, 'blog')} className="min-w-0 flex-1">
                                        <h3 className="font-bold text-base text-white leading-snug line-clamp-2 group-hover:text-red-400 transition-colors mb-2">
                                            {blog.title}
                                        </h3>
                                        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed mb-4">
                                            {blog.excerpt || 'Read the latest in-depth analysis from our sports experts.'}
                                        </p>
                                    </Link>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-700/60 mt-auto gap-3">
                                        <div className="flex items-center gap-2 min-w-0">
                                            {avatarUrl ? (
                                                <img
                                                    src={avatarUrl}
                                                    alt={getAuthorName(blog.author)}
                                                    className="w-7 h-7 rounded-full object-cover border border-slate-600 flex-shrink-0"
                                                />
                                            ) : (
                                                <div className="w-7 h-7 rounded-full bg-red-600/20 border border-red-600/30 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-[10px] font-bold text-red-400">
                                                        {getAuthorInitial(blog.author)}
                                                    </span>
                                                </div>
                                            )}
                                            <span className="text-xs font-semibold text-slate-300 truncate">
                                                {getAuthorName(blog.author)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {views > 0 && (
                                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                                    <Eye className="w-3.5 h-3.5" />
                                                    {views.toLocaleString()}
                                                </span>
                                            )}
                                            <span className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white group-hover:bg-red-500 transition-colors">
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
