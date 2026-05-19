'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { usePathname } from 'next/navigation'

interface SiteScript {
    id: string
    slug: string
    script_type: 'script-src' | 'script-inline' | 'meta' | 'link' | 'json-ld' | 'noscript' | 'raw-html'
    placement: 'head' | 'body-start' | 'body-end'
    content: string
    src: string | null
    attributes: Record<string, any>
    pages: string[]
    exclude_pages: string[]
    loading_strategy: 'beforeInteractive' | 'afterInteractive' | 'lazyOnload' | 'worker'
    priority: number
}

function matchesPath(patterns: string[], path: string): boolean {
    return patterns.some(pattern => {
        if (pattern === '*') return true
        // Convert glob pattern to regex
        const regex = new RegExp(
            '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
        )
        return regex.test(path)
    })
}

export function DynamicScripts() {
    const [scripts, setScripts] = useState<SiteScript[]>([])
    const pathname = usePathname()

    useEffect(() => {
        fetch('/api/site-scripts')
            .then(r => r.json())
            .then(data => setScripts(data.scripts ?? []))
            .catch(() => {})
    }, [])

    // Filter scripts based on current page
    const activeScripts = scripts.filter(s => {
        const included = matchesPath(s.pages, pathname)
        const excluded = s.exclude_pages.length > 0 && matchesPath(s.exclude_pages, pathname)
        return included && !excluded
    })

    if (activeScripts.length === 0) return null

    return (
        <>
            {activeScripts.map(s => {
                switch (s.script_type) {
                    case 'script-src':
                        return (
                            <Script
                                key={s.id}
                                id={`site-script-${s.slug}`}
                                src={s.src || s.content}
                                strategy={s.loading_strategy}
                                {...(s.attributes || {})}
                            />
                        )

                    case 'script-inline':
                        return (
                            <Script
                                key={s.id}
                                id={`site-script-${s.slug}`}
                                strategy={s.loading_strategy}
                                {...(s.attributes || {})}
                            >
                                {s.content}
                            </Script>
                        )

                    case 'meta':
                        return (
                            <MetaTag
                                key={s.id}
                                slug={s.slug}
                                content={s.content}
                                attributes={s.attributes}
                            />
                        )

                    case 'json-ld':
                        return (
                            <Script
                                key={s.id}
                                id={`site-script-${s.slug}`}
                                type="application/ld+json"
                                strategy={s.loading_strategy}
                            >
                                {s.content}
                            </Script>
                        )

                    case 'noscript':
                        return (
                            <noscript
                                key={s.id}
                                dangerouslySetInnerHTML={{ __html: s.content }}
                            />
                        )

                    case 'link':
                        return (
                            <LinkTag
                                key={s.id}
                                slug={s.slug}
                                content={s.content}
                                attributes={s.attributes}
                            />
                        )

                    case 'raw-html':
                        return (
                            <div
                                key={s.id}
                                dangerouslySetInnerHTML={{ __html: s.content }}
                                style={{ display: 'contents' }}
                            />
                        )

                    default:
                        return null
                }
            })}
        </>
    )
}

/**
 * Inject <meta> tag dynamically
 */
function MetaTag({ slug, content, attributes }: { slug: string; content: string; attributes: Record<string, any> }) {
    useEffect(() => {
        const metaName = attributes?.name || attributes?.property || slug
        const selector = attributes?.property
            ? `meta[property="${metaName}"]`
            : `meta[name="${metaName}"]`

        let el = document.querySelector(selector) as HTMLMetaElement | null
        if (!el) {
            el = document.createElement('meta')
            document.head.prepend(el)
        }

        // Set content
        if (attributes?.name) {
            el.setAttribute('name', attributes.name)
            el.setAttribute('content', content)
        } else if (attributes?.property) {
            el.setAttribute('property', attributes.property)
            el.setAttribute('content', content)
        } else if (attributes?.['http-equiv']) {
            el.setAttribute('http-equiv', attributes['http-equiv'])
            el.setAttribute('content', content)
        } else {
            el.setAttribute('name', slug)
            el.setAttribute('content', content)
        }

        // Apply additional attributes (skip name/property/http-equiv as already set)
        Object.entries(attributes || {}).forEach(([key, val]) => {
            if (key !== 'name' && key !== 'property' && key !== 'http-equiv') {
                el!.setAttribute(key, String(val))
            }
        })

        return () => {
            el?.remove()
        }
    }, [slug, content, attributes])

    return null
}

/**
 * Inject <link> tag dynamically
 */
function LinkTag({ slug, content, attributes }: { slug: string; content: string; attributes: Record<string, any> }) {
    useEffect(() => {
        const id = `site-link-${slug}`
        let el = document.getElementById(id) as HTMLLinkElement | null
        if (!el) {
            el = document.createElement('link')
            el.id = id
            document.head.prepend(el)
        }

        if (content) el.href = content
        Object.entries(attributes || {}).forEach(([key, val]) => {
            el!.setAttribute(key, String(val))
        })

        return () => {
            el?.remove()
        }
    }, [slug, content, attributes])

    return null
}
