'use client'

import { useState } from 'react'
import { HelpCircle, ChevronDown, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FaqItem {
    question: string
    answer: string
}

interface CategoryFaqSectionProps {
    faqs: FaqItem[]
    categoryName?: string
    className?: string
}

export function CategoryFaqSection({ faqs, categoryName, className }: CategoryFaqSectionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    if (!faqs || faqs.length === 0) return null

    const validFaqs = faqs.filter(f => f.question?.trim() && f.answer?.trim())
    if (validFaqs.length === 0) return null

    // FAQ JSON-LD for Google rich snippets
    const faqJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: validFaqs.map(f => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: f.answer,
            },
        })),
    }

    return (
        <section className={cn('mt-12 mb-8', className)}>
            {/* FAQ Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />

            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-b from-slate-50/80 via-white to-white shadow-sm">
                {/* Decorative accent */}
                <div className="absolute top-0 left-0 -mt-12 -ml-12 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

                {/* Header */}
                <div className="flex items-center gap-3 px-6 sm:px-8 pt-6 sm:pt-8 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-sm">
                        <HelpCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 font-display">
                                {categoryName ? `${categoryName} FAQ` : 'Frequently Asked Questions'}
                            </h3>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100/80 text-amber-700">
                                <Sparkles className="w-2.5 h-2.5" />
                                {validFaqs.length}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Quick answers to common questions
                        </p>
                    </div>
                </div>

                {/* FAQ Items */}
                <div className="px-6 sm:px-8 pb-6 sm:pb-8 space-y-2">
                    {validFaqs.map((faq, i) => {
                        const isOpen = openIndex === i
                        return (
                            <div
                                key={i}
                                className={cn(
                                    'rounded-xl border transition-all duration-200',
                                    isOpen
                                        ? 'border-amber-200 bg-amber-50/30 shadow-sm'
                                        : 'border-slate-200/60 bg-white hover:border-amber-200/60'
                                )}
                            >
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : i)}
                                    className="w-full flex items-start gap-3 px-4 py-3.5 text-left"
                                >
                                    <span className={cn(
                                        'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black mt-0.5 transition-colors',
                                        isOpen
                                            ? 'bg-amber-500 text-white'
                                            : 'bg-slate-100 text-slate-500'
                                    )}>
                                        {i + 1}
                                    </span>
                                    <span className={cn(
                                        'flex-1 text-sm font-bold transition-colors leading-snug',
                                        isOpen ? 'text-amber-900' : 'text-slate-800'
                                    )}>
                                        {faq.question}
                                    </span>
                                    <ChevronDown className={cn(
                                        'w-4 h-4 flex-shrink-0 mt-0.5 transition-transform duration-200 text-slate-400',
                                        isOpen && 'rotate-180 text-amber-600'
                                    )} />
                                </button>

                                {/* Answer */}
                                <div className={cn(
                                    'overflow-hidden transition-all duration-200',
                                    isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                                )}>
                                    <div className="px-4 pb-4 pl-[52px]">
                                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
