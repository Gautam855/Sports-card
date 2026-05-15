'use client'

import { Twitter, Facebook, Link2, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ShareButtonsProps {
    url: string
    title: string
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
    const encoded = encodeURIComponent(url)
    const encodedTitle = encodeURIComponent(title)

    const share = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title, url })
                return
            } catch { }
        }
        await navigator.clipboard.writeText(url)
        toast.success('Link copied!')
    }

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encoded}`, '_blank')}
            >
                <Twitter className="w-3.5 h-3.5" />
                Twitter
            </Button>
            <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encoded}`, '_blank')}
            >
                <Facebook className="w-3.5 h-3.5" />
                Facebook
            </Button>
            <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => window.open(`https://wa.me/?text=${encodedTitle}%20${encoded}`, '_blank')}
            >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={share}>
                <Link2 className="w-3.5 h-3.5" />
                Copy Link
            </Button>
        </div>
    )
}