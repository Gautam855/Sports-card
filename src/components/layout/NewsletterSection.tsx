'use client'

import { Mail } from 'lucide-react'

export function NewsletterSection() {
  return (
    <section className="container-wide py-16">
      <div className="bg-primary rounded-[2rem] p-8 md:p-12 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent)]" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <Mail className="w-12 h-12 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Never miss a match update.</h2>
          <p className="text-primary-foreground/80 text-lg mb-8">
            Get the latest predictions and fantasy tips delivered straight to your inbox every week.
          </p>
          <form className="flex flex-col sm:flex-row gap-3">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="flex-1 px-6 py-4 rounded-full bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button className="bg-slate-900 text-white px-8 py-4 rounded-full font-bold hover:bg-slate-800 transition-all">
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
