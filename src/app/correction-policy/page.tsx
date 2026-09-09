import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, AlertCircle, FileCheck, RefreshCw, Send, Mail, ShieldAlert } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Corrections Policy — SportsLNV Editorial Standards',
    description: 'Learn about SportsLNV commitment to accuracy, transparency, accountability, and how we handle corrections and factual updates.',
    alternates: { canonical: '/correction-policy' },
    openGraph: {
        title: 'Corrections Policy — SportsLNV',
        description: 'Learn about SportsLNV commitment to accuracy, transparency, accountability, and how we handle corrections and factual updates.',
        url: 'https://www.sportslnv.com/correction-policy',
        type: 'website',
    },
}

export default function CorrectionPolicyPage() {
    return (
        <div className="container-wide py-12 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-10 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-6 bg-red-600 rounded-full" />
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-red-600">
                        Editorial Standards
                    </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
                    Corrections Policy
                </h1>
                <p className="text-sm text-slate-500">
                    Last updated: September 2026
                </p>
            </div>

            {/* Mission Statement Hero */}
            <div className="mb-10 p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white shadow-sm border border-slate-800">
                <p className="text-base md:text-lg font-medium leading-relaxed mb-4">
                    At <span className="font-bold text-white">SportsLNV</span>, we are committed to maintaining accuracy, transparency, and accountability in our journalism. We understand that accurate information is essential for building trust with our readers.
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">
                    While our editorial team follows a careful verification process before publishing content, errors may occasionally occur. When a factual error is identified, we take appropriate steps to review and correct the information promptly.
                </p>
            </div>

            <div className="space-y-10 text-slate-700 leading-relaxed text-sm md:text-base">
                {/* 1. Our Commitment to Accuracy */}
                <section className="space-y-3">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-red-600 shrink-0" />
                        Our Commitment to Accuracy
                    </h2>
                    <p>
                        SportsLNV follows responsible editorial practices to ensure that published content is accurate, reliable, and properly sourced. Our team reviews articles before publication and verifies important facts through credible sources, primary reporting, official sports federations, and verified club records.
                    </p>
                    <p>
                        We continuously work to improve our editorial processes and maintain the highest standards of sports journalism and analytical reporting.
                    </p>
                </section>

                {/* 2. Types of Corrections */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                        Types of Corrections
                    </h2>
                    <p>
                        Corrections may arise across different formats and components of our stories. These include:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                            <p className="font-bold text-slate-900 text-sm mb-1">Factual Inaccuracies</p>
                            <p className="text-xs text-slate-600">
                                Incorrect facts, statistics, game figures, dates, player or team names, scores, or quotes.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                            <p className="font-bold text-slate-900 text-sm mb-1">Headline &amp; Caption Errors</p>
                            <p className="text-xs text-slate-600">
                                Misleading or imprecise headlines, photo captions, video descriptions, or infobox details.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                            <p className="font-bold text-slate-900 text-sm mb-1">Contextual Omissions</p>
                            <p className="text-xs text-slate-600">
                                Missing context or unbalanced reporting that may affect a reader&apos;s clear understanding of a story.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                            <p className="font-bold text-slate-900 text-sm mb-1">New Verified Information</p>
                            <p className="text-xs text-slate-600">
                                Significant updates required when new confirmed facts emerge after a breaking news report is published.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 3. How We Handle Corrections */}
                <section className="space-y-3">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
                        <RefreshCw className="w-5 h-5 text-red-600 shrink-0" />
                        How We Handle Corrections
                    </h2>
                    <p>
                        When an error is identified, our editorial team reviews the concern and determines the appropriate action. Depending on the nature of the correction, we may:
                    </p>
                    <ul className="space-y-2 text-slate-600">
                        <li className="flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 shrink-0" />
                            <span><strong>Update the article</strong> with accurate, re-verified information.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 shrink-0" />
                            <span><strong>Add a correction note or clarification</strong> where required, highlighting what was changed.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 shrink-0" />
                            <span><strong>Update relevant details</strong> while maintaining the original context and integrity of the story.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 shrink-0" />
                            <span><strong>Remove content</strong> if it fails to meet our editorial standards or is demonstrated to be fundamentally false.</span>
                        </li>
                    </ul>
                </section>

                {/* 4. Transparency in Corrections */}
                <section className="space-y-3">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
                        <FileCheck className="w-5 h-5 text-red-600 shrink-0" />
                        Transparency in Corrections
                    </h2>
                    <p>
                        SportsLNV believes corrections should be completely transparent. Significant factual corrections may include an update note explaining that changes have been made, placed at either the top or bottom of the article.
                    </p>
                    <p className="p-4 rounded-xl bg-slate-100 border-l-4 border-red-600 text-slate-800 text-sm font-medium">
                        We do not silently alter important information in a way that misleads readers. Our goal is to ensure readers always have access to accurate and updated information with full editorial honesty.
                    </p>
                </section>

                {/* 5. Reader Feedback and Error Reporting */}
                <section className="space-y-3">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
                        <Send className="w-5 h-5 text-red-600 shrink-0" />
                        Reader Feedback and Error Reporting
                    </h2>
                    <p>
                        We encourage readers to notify us if they identify a possible factual error or have concerns regarding any published article. Reader vigilance is a critical partner in keeping our sports journalism accurate.
                    </p>
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                        <p className="font-bold text-slate-900 text-sm mb-2.5">
                            When submitting a correction request, readers are encouraged to provide:
                        </p>
                        <ol className="list-decimal list-inside space-y-1.5 text-sm text-slate-700">
                            <li><strong>Article title or URL:</strong> The exact link to the story in question.</li>
                            <li><strong>Description of the suspected error:</strong> Specify the paragraph, quote, or metric that appears incorrect.</li>
                            <li><strong>Supporting information or reliable sources:</strong> Official match sheets, verified club statements, or reputable references if available.</li>
                            <li><strong>Contact details:</strong> Your name and email address for any necessary follow-up or clarification.</li>
                        </ol>
                    </div>
                </section>

                {/* 6. Editorial Review Process */}
                <section className="space-y-3">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
                        <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
                        Editorial Review Process
                    </h2>
                    <p>
                        All correction requests are reviewed by our senior editorial team. Decisions regarding corrections are based on factual accuracy, source credibility, and journalistic standards.
                    </p>
                    <p>
                        We aim to address valid correction requests as quickly as possible while maintaining fairness and editorial integrity.
                    </p>
                </section>

                {/* 7. Contact Us Box */}
                <section className="pt-6 border-t border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-red-600" />
                        Contact Our Editorial Team
                    </h2>
                    <p className="mb-4">
                        To report an error or request a correction, please contact our editorial desk directly:
                    </p>

                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                        <div className="space-y-1">
                            <p className="text-xs font-bold uppercase tracking-wider text-red-600">SportsLNV Editorial Desk</p>
                            <p className="text-base font-bold text-slate-900">Corrections &amp; Standards Bureau</p>
                            <p className="text-sm text-slate-600">
                                Email:{' '}
                                <a href="mailto:editorial@sportslnv.com" className="text-red-600 font-semibold hover:underline">
                                    editorial@sportslnv.com
                                </a>
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                            <a
                                href="mailto:editorial@sportslnv.com?subject=Correction%20Request%20-%20SportsLNV"
                                className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
                            >
                                Report an Error →
                            </a>
                            <Link
                                href="/contact"
                                className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                            >
                                Contact Page
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
