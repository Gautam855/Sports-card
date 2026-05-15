'use client'

import { useState } from 'react'
import { Share2, Twitter, Facebook, Linkedin, Link2, Check, Mail } from 'lucide-react'
import { toast } from 'sonner'

interface ShareButtonsProps {
    url: string
    title: string
    description?: string
}

export function ShareButtons({ url, title, description }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false)
    const encodedUrl = encodeURIComponent(url)
    const encodedTitle = encodeURIComponent(title)
    const encodedDesc = encodeURIComponent(description || '')

    const links = [
        {
            name: 'Twitter / X',
            icon: Twitter,
            href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
            color: 'hover:bg-sky-500/10 hover:text-sky-500',
        },
        {
            name: 'Facebook',
            icon: Facebook,
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            color: 'hover:bg-blue-600/10 hover:text-blue-600',
        },
        {
            name: 'LinkedIn',
            icon: Linkedin,
            href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDesc}`,
            color: 'hover:bg-blue-700/10 hover:text-blue-700',
        },
        {
            name: 'Email',
            icon: Mail,
            href: `mailto:?subject=${encodedTitle}&body=${encodedDesc}%0A%0A${encodedUrl}`,
            color: 'hover:bg-emerald-500/10 hover:text-emerald-500',
        },
    ]

    async function trackShare(platform: string) {
        try {
            await fetch('/api/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contentId: url.split('/').pop(),
                    contentType: 'news',
                    eventType: 'share_click',
                    metadata: { platform }
                })
            })
        } catch (e) {
            console.error('Failed to track share', e)
        }
    }

    async function copyLink() {
        trackShare('copy_link')
        try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            toast.success('Link copied!')
            setTimeout(() => setCopied(false), 2000)
        } catch {
            toast.error('Failed to copy')
        }
    }

    return (
        <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-muted-foreground mr-2 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5" /> Share
            </span>
            {links.map(({ name, icon: Icon, href, color }) => (
                <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Share on ${name}`}
                    onClick={() => trackShare(name)}
                    className={`p-2 rounded-lg text-muted-foreground transition-all ${color}`}
                >
                    <Icon className="w-4 h-4" />
                </a>
            ))}
            <button
                onClick={copyLink}
                title="Copy link"
                className="p-2 rounded-lg text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
            >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Link2 className="w-4 h-4" />}
            </button>
        </div>
    )
}
