'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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

const AUTO_SLIDE_INTERVAL = 5000

export function HeroCarousel({ articles }: { articles: News[] }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const [mounted, setMounted] = useState(false)

    const totalSlides = articles.length

    useEffect(() => {
        setMounted(true)
    }, [])

    const goToNext = useCallback(() => {
        if (totalSlides <= 1) return
        setCurrentIndex((prev) => (prev + 1) % totalSlides)
    }, [totalSlides])

    const goToPrev = useCallback(() => {
        if (totalSlides <= 1) return
        setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides)
    }, [totalSlides])

    const goToSlide = useCallback((index: number) => {
        setCurrentIndex(index)
    }, [])

    // Auto-slide
    useEffect(() => {
        if (totalSlides <= 1 || isPaused) return
        const timer = setInterval(goToNext, AUTO_SLIDE_INTERVAL)
        return () => clearInterval(timer)
    }, [totalSlides, isPaused, goToNext])

    // Don't render carousel overlay until client-side JS has mounted
    // This prevents any flash — the server-rendered first slide stays visible
    if (!mounted || totalSlides <= 1) return null

    const article = articles[currentIndex]
    if (!article) return null

    return (
        <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="contents"
        >
            {/* Image overlay — all slides stacked with opacity transitions */}
            <div className="absolute inset-0 z-20" style={{ pointerEvents: currentIndex === 0 ? 'none' : 'auto' }}>
                {articles.map((a, index) => {
                    // Skip first slide (already rendered by server)
                    if (index === 0) return null
                    const img = getCoverImage(a)
                    return (
                        <Link
                            key={a.id || index}
                            {...getArticleLinkProps(a)}
                            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                                index === currentIndex
                                    ? 'opacity-100 z-10'
                                    : 'opacity-0 z-0 pointer-events-none'
                            }`}
                            aria-hidden={index !== currentIndex}
                            tabIndex={index === currentIndex ? 0 : -1}
                        >
                            {img ? (
                                <Image
                                    src={img}
                                    alt={a.title}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 750px"
                                    loading="lazy"
                                    className="object-cover hover:scale-[1.02] transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-200">
                                    <span className="text-5xl font-black text-slate-300">
                                        {a.title[0]}
                                    </span>
                                </div>
                            )}
                        </Link>
                    )
                })}
            </div>

            {/* Hide first slide when carousel moves away from it */}
            {currentIndex !== 0 && (
                <style>{`.hero-first-slide { opacity: 0 !important; }`}</style>
            )}

            {/* Carousel dots */}
            <div className="flex justify-center items-center gap-1 mt-2">
                {articles.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                        className="p-2.5 flex items-center justify-center min-w-[36px] min-h-[36px]"
                    >
                        <span
                            className={`h-2 rounded-full transition-all duration-300 ${
                                index === currentIndex
                                    ? 'w-6 bg-red-600'
                                    : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                            }`}
                        />
                    </button>
                ))}
            </div>

            {/* Visible content panel for carousel navigation */}
            <HeroContentPanel article={article} currentIndex={currentIndex} />

            {/* Prev/Next buttons */}
            <div className="flex gap-2">
                <button
                    onClick={goToPrev}
                    aria-label="Previous slide"
                    className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 active:scale-95 text-slate-600 transition-all"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                    onClick={goToNext}
                    aria-label="Next slide"
                    className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 active:scale-95 text-slate-600 transition-all"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}

/** Swaps out the server-rendered content when carousel navigates away from slide 0 */
function HeroContentPanel({ article, currentIndex }: { article: News; currentIndex: number }) {
    if (currentIndex === 0) return null

    return (
        <>
            {/* Hide server-rendered content */}
            <style>{`.hero-server-content { display: none !important; }`}</style>

            {/* Show carousel-driven content */}
            <div className="w-full lg:w-[42%] flex flex-col pt-1 lg:pt-2 min-h-[280px] animate-fade-in">
                <span className="home-category mb-3">
                    {getCategoryName(article.category)}
                </span>
                <Link {...getArticleLinkProps(article)} className="group">
                    <h2 className="text-2xl md:text-3xl lg:text-[2rem] font-display font-black leading-tight mb-3 group-hover:text-red-600 transition-colors text-slate-900">
                        {article.title}
                    </h2>
                </Link>
                {article.excerpt && (
                    <p className="text-slate-600 text-sm md:text-base mb-5 leading-relaxed line-clamp-3">
                        {article.excerpt}
                    </p>
                )}

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                        <span className="font-bold text-xs text-slate-700">
                            {getAuthorInitial(article.author)}
                        </span>
                    </div>
                    <div>
                        <p className="font-bold text-sm text-slate-900">
                            {getAuthorName(article.author)}
                        </p>
                        <p className="text-xs text-slate-500" suppressHydrationWarning>
                            {formatArticleDate(article)} · {getReadTime(article)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-auto">
                    <Link {...getArticleLinkProps(article)} className="home-btn-dark">
                        Read Full Story
                    </Link>
                </div>
            </div>
        </>
    )
}
