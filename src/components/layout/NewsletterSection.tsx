'use client'

import { Mail } from 'lucide-react'

export function NewsletterSection() {
    return (
        <section className="home-section py-6 pb-8 md:pb-6">
            <div className="bg-slate-900 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-10">
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 flex-1">
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                        <Mail className="w-8 h-8 text-slate-900" />
                    </div>
                    <div>
                        <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-wide mb-1.5">
                            Stay Updated
                        </h2>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                            Subscribe to our newsletter and get the latest sports news and blog updates straight to your inbox.
                        </p>
                    </div>
                </div>

                <form className="flex w-full md:w-auto gap-2 flex-shrink-0">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="flex-1 md:w-56 px-4 py-3 rounded-lg bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-slate-400"
                    />
                    <button
                        type="submit"
                        className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors uppercase tracking-wider text-sm flex-shrink-0"
                    >
                        Subscribe
                    </button>
                </form>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center md:text-left md:ml-[84px]">
                No spam. Unsubscribe anytime.
            </p>
        </section>
    )
}
