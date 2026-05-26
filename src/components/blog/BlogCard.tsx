'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, User, Clock, ArrowRight, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { News } from '@/lib/types'

interface BlogCardProps {
    blog: News
    className?: string
}

export function BlogCard({ blog, className }: BlogCardProps) {
    return (
        <Link href={`/blog/${blog.slug}`}>
            <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={cn(
                    'group bg-card border border-border/50 rounded-2xl overflow-hidden flex flex-col h-full hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5',
                    className
                )}
            >
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    {blog.cover_image ? (
                        <img
                            src={blog.cover_image}
                            alt={blog.cover_alt || blog.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-blue-500/10">
                            <span className="text-4xl font-black text-primary/20">{blog.title[0]}</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Category Badge */}
                    {blog.category && (
                        <div className="absolute top-3 left-3">
                            <span
                                className="text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md backdrop-blur-md"
                                style={{ backgroundColor: (blog.category.color || '#6366f1') + 'cc' }}
                            >
                                {blog.category.name}
                            </span>
                        </div>
                    )}

                    {/* Featured badge */}
                    {blog.is_featured && (
                        <div className="absolute top-3 right-3">
                            <span className="bg-amber-500/90 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md backdrop-blur-md">
                                ⭐ Featured
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-3">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(blog.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {blog.read_time_mins || 5} min
                        </span>
                    </div>

                    <h3 className="text-base font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2 mb-3">
                        {blog.title}
                    </h3>

                    <p className="text-xs text-muted-foreground line-clamp-2 mb-6 flex-1">
                        {blog.excerpt 
                            ? (blog.excerpt.length > 70 ? blog.excerpt.substring(0, 70) + '...' : blog.excerpt) 
                            : 'Read the latest in-depth analysis from our sports experts.'}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                <User className="w-3 h-3 text-primary" />
                            </div>
                            <span className="text-[11px] font-semibold text-foreground/80">
                                {blog.author?.display_name || 'SportsLNV'}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            {(blog.views ?? 0) > 0 && (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Eye className="w-3 h-3" /> {(blog.views ?? 0).toLocaleString()}
                                </span>
                            )}
                            <div className="text-primary group-hover:translate-x-1 transition-transform">
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    )
}
