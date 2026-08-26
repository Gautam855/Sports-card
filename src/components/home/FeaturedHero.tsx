'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
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

const AUTO_SLIDE_INTERVAL = 5000 // 5 seconds

export function FeaturedHero({ articles }: { articles: News[] }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)

    const totalSlides = articles.length

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

        const timer = setInterval(() => {
            goToNext()
        }, AUTO_SLIDE_INTERVAL)

        return () => clearInterval(timer)
    }, [totalSlides, isPaused, goToNext])

    if (!articles || articles.length === 0) return null

    const article = articles[currentIndex]
    if (!article) return null

    const coverImage = getCoverImage(article)

    return (
        <section
            className="home-section pt-6 pb-2"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
                {/* Image with slide transition */}
                <div className="w-full lg:w-[58%]">
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                        <div className="relative aspect-[16/10] w-full">
                            {articles.map((a, index) => {
                                const img = getCoverImage(a)
                                return (
                                    <Link
                                        key={a.id || index}
                                        {...getArticleLinkProps(a)}
                                        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                                            index === currentIndex
                                                ? 'opacity-100 z-10'
                                                : 'opacity-0 z-0'
                                        }`}
                                        aria-hidden={index !== currentIndex}
                                        tabIndex={index === currentIndex ? 0 : -1}
                                    >
                                        {img ? (
                                            <img
                                                src={img}
                                                alt={a.title}
                                                className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500"
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
                    </div>

                    {/* Carousel dots */}
                    {totalSlides > 1 && (
                        <div className="flex justify-center gap-1.5 mt-3">
                            {articles.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    aria-label={`Go to slide ${index + 1}`}
                                    className={`h-1 rounded-full transition-all duration-300 ${
                                        index === currentIndex
                                            ? 'w-5 bg-red-600'
                                            : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Content with fade transition */}
                <div className="w-full lg:w-[42%] flex flex-col pt-1 lg:pt-2 min-h-[280px]">
                    <div
                        key={currentIndex}
                        className="animate-fade-in flex flex-col flex-1"
                    >
                        <span className="home-category mb-3">
                            {getCategoryName(article.category)}
                        </span>
                        <Link {...getArticleLinkProps(article)} className="group">
                            <h1 className="text-2xl md:text-3xl lg:text-[2rem] font-display font-black leading-tight mb-3 group-hover:text-red-600 transition-colors text-slate-900">
                                {article.title}
                            </h1>
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
                                <p className="text-xs text-slate-500">
                                    {formatArticleDate(article)} · {getReadTime(article)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                        <Link {...getArticleLinkProps(article)} className="home-btn-dark">
                            Read Full Story
                        </Link>
                        {totalSlides > 1 && (
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
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
