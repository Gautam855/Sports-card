import React from 'react'
import { AdSenseSlot } from '@/components/ads/AdSenseSlot'

interface Props {
    content: string
}

export function BlogContent({ content }: Props) {
    // 1. Process standard SEO replacements
    const processedHtml = (content || '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<link[^>]*rel="stylesheet"[^>]*>/gi, '')
        .replace(/<(h[23])>(.*?)<\/h[23]>/g, (match, tag, text, offset) => {
            const id = `heading-${offset}`
            return `<${tag} id="${id}">${text}</${tag}>`
        })

    // 2. Parse shortcodes like [ad] or [ad slot="12345"] or <p>[ad]</p>
    const regex = /(?:<p>)?\[ad(?:\s+slot="([^"]+)")?\](?:<\/p>)?/g

    type Part = { type: 'html'; content: string } | { type: 'ad'; slot: string | undefined }
    const parts: Part[] = []
    let lastIndex = 0
    let match

    while ((match = regex.exec(processedHtml)) !== null) {
        if (match.index > lastIndex) {
            parts.push({ type: 'html', content: processedHtml.slice(lastIndex, match.index) })
        }
        parts.push({ type: 'ad', slot: match[1] || undefined })
        lastIndex = regex.lastIndex
    }

    if (lastIndex < processedHtml.length) {
        parts.push({ type: 'html', content: processedHtml.slice(lastIndex) })
    }

    return (
        <div className="prose prose-lg prose-slate dark:prose-invert max-w-none
            prose-headings:font-display prose-headings:tracking-tight
            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:border-b prose-h2:border-border/50 prose-h2:pb-3
            prose-h3:text-xl prose-h3:mt-8
            prose-p:leading-relaxed prose-p:text-foreground/85
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-xl prose-img:shadow-lg
            prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
            prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
            prose-strong:text-foreground"
        >
            {parts.map((part, i) => {
                if (part.type === 'html') {
                    return <div key={i} dangerouslySetInnerHTML={{ __html: part.content }} style={{ display: 'contents' }} />
                } else {
                    return <AdSenseSlot key={i} slotId={part.slot} />
                }
            })}
        </div>
    )
}
