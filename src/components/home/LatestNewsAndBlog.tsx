import Link from 'next/link'
import { getArticleLinkProps } from '@/lib/article-links'
import {
    getCategoryName,
    formatArticleDate,
    getAuthorName,
    getAuthorInitial,
    getReadTime,
    getCoverImage,
} from '@/lib/home-utils'
import type { News } from '@/lib/types'

export function LatestNewsAndBlog({ news, blog }: { news?: News[]; blog?: News }) {
    const newsList = news?.slice(0, 3) ?? []
    if (!newsList.length && !blog) return null

    return (
        <section className="home-section py-8 border-b border-slate-100 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-start">
                {/* Latest Sports News */}
                {newsList.length > 0 && (
                    <div className="lg:col-span-7 min-w-0">
                        <h2 className="home-section-title mb-5">Latest Sports News</h2>
                        <div className="flex flex-col divide-y divide-slate-100">
                            {newsList.map((item) => {
                                const coverImage = getCoverImage(item)
                                return (
                                    <Link
                                        key={item.id}
                                        {...getArticleLinkProps(item)}
                                        className="group flex gap-4 py-5 first:pt-0 last:pb-0 items-start"
                                    >
                                        <div className="w-32 sm:w-40 aspect-[4/3] rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200">
                                            {coverImage ? (
                                                <img
                                                    src={coverImage}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400 font-black text-2xl">
                                                    {item.title[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col flex-1 min-w-0 pt-0.5">
                                            <span className="home-category mb-1.5">{getCategoryName(item.category)}</span>
                                            <h3 className="font-bold text-base md:text-lg leading-snug text-slate-900 group-hover:text-red-600 transition-colors mb-1.5 line-clamp-2">
                                                {item.title}
                                            </h3>
                                            {item.excerpt && (
                                                <p className="text-slate-500 text-sm line-clamp-2 mb-2 hidden sm:block">
                                                    {item.excerpt}
                                                </p>
                                            )}
                                            <p className="text-xs text-slate-400 mt-auto">
                                                {formatArticleDate(item)} · {getReadTime(item)}
                                            </p>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Featured Blog */}
                {blog && (
                    <div
                        className={`min-w-0 ${
                            newsList.length > 0 ? 'lg:col-span-5' : 'lg:col-span-12 max-w-lg mx-auto w-full'
                        }`}
                    >
                        <h2 className="home-section-title mb-5">Featured Blog</h2>
                        <div className="home-card flex flex-col overflow-hidden group">
                            <Link
                                {...getArticleLinkProps(blog, 'blog')}
                                className="relative block w-full aspect-[16/10] overflow-hidden bg-slate-100 flex-shrink-0"
                            >
                                {getCoverImage(blog) ? (
                                    <img
                                        src={getCoverImage(blog)}
                                        alt={blog.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-200">
                                        <span className="text-4xl font-black text-slate-300">{blog.title[0]}</span>
                                    </div>
                                )}
                            </Link>

                            <div className="p-4 sm:p-5 flex flex-col gap-3 min-w-0">
                                <span className="home-category">{getCategoryName(blog.category)}</span>

                                <Link {...getArticleLinkProps(blog, 'blog')} className="min-w-0">
                                    <h3 className="font-bold text-base sm:text-lg leading-snug text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2">
                                        {blog.title}
                                    </h3>
                                </Link>

                                {blog.excerpt && (
                                    <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                                        {blog.excerpt}
                                    </p>
                                )}

                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                                        <span className="font-bold text-xs text-slate-600">
                                            {getAuthorInitial(blog.author)}
                                        </span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-xs text-slate-900 truncate">
                                            {getAuthorName(blog.author)}
                                        </p>
                                        <p className="text-[10px] text-slate-400 truncate">
                                            {formatArticleDate(blog)} · {getReadTime(blog)}
                                        </p>
                                    </div>
                                </div>

                                <Link
                                    {...getArticleLinkProps(blog, 'blog')}
                                    className="home-btn-dark w-full text-center mt-1"
                                >
                                    Read Blog
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}
