import type { Metadata } from 'next'
import { Mail, MapPin, Phone, MessageSquare, Send, CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Contact Us — SportsLNV Support & Editorial',
    description: 'Get in touch with the SportsLNV team for editorial queries, partnership inquiries, or general support.',
    alternates: { canonical: '/contact' },
}

export default function ContactPage() {
    return (
        <div className="container-wide py-12 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-10 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-6 bg-red-600 rounded-full" />
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-red-600">
                        Get In Touch
                    </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
                    Contact Us
                </h1>
                <p className="text-slate-600 text-sm md:text-base max-w-2xl">
                    Have a question, feedback, or a story tip? We would love to hear from you. Fill out the form or reach out directly.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Contact Information */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-6">
                        <h2 className="text-lg font-bold text-slate-900">
                            Direct Contacts
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3.5">
                                <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">General Inquiries</p>
                                    <a href="mailto:support@sportslnv.com" className="text-sm font-semibold text-slate-900 hover:text-red-600 transition-colors">
                                        support@sportslnv.com
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-3.5">
                                <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center flex-shrink-0">
                                    <MessageSquare className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Editorial Desk</p>
                                    <a href="mailto:editorial@sportslnv.com" className="text-sm font-semibold text-slate-900 hover:text-red-600 transition-colors">
                                        editorial@sportslnv.com
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-3.5">
                                <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Coverage</p>
                                    <p className="text-sm font-medium text-slate-800">
                                        Global Sports Coverage · 24/7 Digital Desk
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white">
                        <h3 className="font-bold text-sm mb-1.5 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            Response Time
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Our team typically responds to inquiries within 24–48 hours on business days.
                        </p>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="lg:col-span-7">
                    <form className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 space-y-5 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-2">
                            Send us a message
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Your Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Rahul Sharma"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="you@example.com"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                Subject
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="What is this regarding?"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                Message
                            </label>
                            <textarea
                                rows={5}
                                required
                                placeholder="Write your message or inquiry here..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-y"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm tracking-wide uppercase shadow-lg shadow-red-600/20 transition-all duration-200"
                        >
                            <Send className="w-4 h-4" />
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
