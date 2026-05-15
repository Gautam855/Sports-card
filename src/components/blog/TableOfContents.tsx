'use client'

import { useEffect, useState } from 'react'
import { List, ChevronRight } from 'lucide-react'

interface TOCItem {
    id: string
    text: string
    level: number
}

export function TableOfContents({ content }: { content: string }) {
    const [toc, setToc] = useState<TOCItem[]>([])

    useEffect(() => {
        // Parse headings from the content string
        const parser = new DOMParser()
        const doc = parser.parseFromString(content, 'text/html')
        const headings = doc.querySelectorAll('h2, h3')
        
        const items: TOCItem[] = Array.from(headings).map((h, i) => {
            const id = h.id || `heading-${i}`
            // We need to ensure the actual DOM elements in the page have these IDs
            // But since we are using dangerouslySetInnerHTML, we should ideally 
            // process the content string to add IDs if they are missing.
            return {
                id,
                text: h.textContent || '',
                level: parseInt(h.tagName.substring(1))
            }
        })
        setToc(items)
    }, [content])

    if (toc.length === 0) return null

    return (
        <div className="bg-muted/30 border border-border rounded-2xl p-5 mb-8">
            <h3 className="font-bold text-sm flex items-center gap-2 mb-4">
                <List className="w-4 h-4 text-primary" />
                Table of Contents
            </h3>
            <nav className="space-y-2">
                {toc.map((item) => (
                    <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={`block text-sm transition-all hover:text-primary flex items-center gap-2 ${
                            item.level === 3 ? 'ml-6 text-muted-foreground' : 'font-medium'
                        }`}
                        onClick={(e) => {
                            e.preventDefault()
                            document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })
                        }}
                    >
                        <ChevronRight className={`w-3 h-3 ${item.level === 3 ? 'opacity-50' : 'text-primary'}`} />
                        {item.text}
                    </a>
                ))}
            </nav>
        </div>
    )
}
