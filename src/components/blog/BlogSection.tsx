'use client'

import { BlogCard } from './BlogCard'
import { ChevronRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { News } from '@/lib/types'

interface BlogSectionProps {
    blogs: News[]
}

export function BlogSection({ blogs }: BlogSectionProps) {
    return (
        <section className="bg-slate-900/40 py-16 border-y border-white/5 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-1/4 h-full bg-blue-500/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="container-wide relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                    <div>
                        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-3">
                            <Sparkles className="w-4 h-4" />
                            <span>Expert Analysis</span>
                        </div>
                        <h2 className="text-2xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
                            Latest From Our <span className="text-primary italic">Blog</span>
                        </h2>
                        <p className="text-sm text-slate-400 mt-2 max-w-md">In-depth sports analysis, expert opinions, and behind-the-scenes stories.</p>
                    </div>
                    <Link
                        href="/blog"
                        className="group flex items-center gap-2 text-xs font-bold text-white bg-white/5 hover:bg-primary px-4 py-2 rounded-full transition-all border border-white/10 hover:border-primary"
                    >
                        Explore All Articles
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogs.length > 0 ? (
                        blogs.map((blog, i) => (
                            <motion.div
                                key={blog.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <BlogCard blog={blog} />
                            </motion.div>
                        ))
                    ) : (
                        [1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse bg-white/5 rounded-2xl h-[400px] border border-white/5" />
                        ))
                    )}
                </div>
            </div>
        </section>
    )
}
