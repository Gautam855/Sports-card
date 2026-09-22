import React from 'react'
import { InArticleAd } from '@/components/ads/AdSenseSlot'

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
        <>
            <div className="blog-content">
                {parts.map((part, i) => {
                    if (part.type === 'html') {
                        return <div key={i} dangerouslySetInnerHTML={{ __html: part.content }} style={{ display: 'contents' }} />
                    } else {
                        return <InArticleAd key={i} />
                    }
                })}
            </div>

            {/* Scoped styles matching custom page formatting */}
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                        /* ── Blog Content Container ── */
                        .blog-content {
                            width: 100%;
                            font-size: 1.0625rem;
                            line-height: 1.8;
                            color: hsl(var(--foreground));
                            word-wrap: break-word;
                            overflow-wrap: break-word;
                        }

                        /* ── Headings ── */
                        .blog-content h2 {
                            font-size: 1.5rem;
                            font-weight: 700;
                            line-height: 1.3;
                            margin-top: 2.5rem;
                            margin-bottom: 1rem;
                            padding-bottom: 0.6rem;
                            border-bottom: 3px solid hsl(var(--primary) / 0.2);
                            color: hsl(var(--foreground));
                            letter-spacing: -0.01em;
                            position: relative;
                        }
                        .blog-content h2::before {
                            content: '';
                            position: absolute;
                            bottom: -3px;
                            left: 0;
                            width: 60px;
                            height: 3px;
                            background: hsl(var(--primary));
                            border-radius: 2px;
                        }
                        .blog-content h3 {
                            font-size: 1.25rem;
                            font-weight: 700;
                            line-height: 1.35;
                            margin-top: 2rem;
                            margin-bottom: 0.75rem;
                            color: hsl(var(--foreground));
                        }
                        .blog-content h4 {
                            font-size: 1.1rem;
                            font-weight: 600;
                            margin-top: 1.5rem;
                            margin-bottom: 0.5rem;
                            color: hsl(var(--foreground));
                        }

                        /* ── Paragraphs ── */
                        .blog-content p {
                            margin-bottom: 1.15rem;
                            color: hsl(var(--muted-foreground));
                            font-size: 1.0625rem;
                            line-height: 1.85;
                        }
                        .blog-content p:last-child {
                            margin-bottom: 0;
                        }

                        /* ── Line Breaks ── */
                        .blog-content br {
                            display: block;
                            content: '';
                            margin-top: 0.25rem;
                        }

                        /* ── Links ── */
                        .blog-content a {
                            color: hsl(var(--primary));
                            text-decoration: none;
                            font-weight: 500;
                            border-bottom: 1px solid hsl(var(--primary) / 0.3);
                            transition: border-color 0.2s ease, color 0.2s ease;
                        }
                        .blog-content a:hover {
                            color: hsl(var(--primary));
                            border-bottom-color: hsl(var(--primary));
                        }

                        /* ── Lists ── */
                        .blog-content ul,
                        .blog-content ol {
                            margin: 1.25rem 0;
                            padding-left: 0;
                            list-style: none;
                        }
                        .blog-content ul li {
                            position: relative;
                            padding-left: 1.75rem;
                            margin-bottom: 0.65rem;
                            color: hsl(var(--muted-foreground));
                            font-size: 1.0625rem;
                            line-height: 1.75;
                        }
                        .blog-content ul li::before {
                            content: '';
                            position: absolute;
                            left: 0;
                            top: 0.65em;
                            width: 8px;
                            height: 8px;
                            border-radius: 50%;
                            background: hsl(var(--primary));
                            opacity: 0.7;
                        }
                        .blog-content ol {
                            counter-reset: list-counter;
                        }
                        .blog-content ol li {
                            position: relative;
                            padding-left: 2rem;
                            margin-bottom: 0.65rem;
                            color: hsl(var(--muted-foreground));
                            font-size: 1.0625rem;
                            line-height: 1.75;
                            counter-increment: list-counter;
                        }
                        .blog-content ol li::before {
                            content: counter(list-counter) '.';
                            position: absolute;
                            left: 0;
                            top: 0;
                            font-weight: 700;
                            color: hsl(var(--primary));
                            font-size: 1rem;
                        }

                        /* ── Strong / Bold ── */
                        .blog-content strong,
                        .blog-content b {
                            font-weight: 600;
                            color: hsl(var(--foreground));
                        }

                        /* ── Emphasis ── */
                        .blog-content em,
                        .blog-content i {
                            font-style: italic;
                        }

                        /* ── Blockquote ── */
                        .blog-content blockquote {
                            margin: 1.75rem 0;
                            padding: 1.25rem 1.5rem;
                            border-left: 4px solid hsl(var(--primary));
                            background: hsl(var(--muted) / 0.4);
                            border-radius: 0 0.75rem 0.75rem 0;
                            font-style: italic;
                            color: hsl(var(--muted-foreground));
                        }
                        .blog-content blockquote p {
                            margin-bottom: 0.5rem;
                        }
                        .blog-content blockquote p:last-child {
                            margin-bottom: 0;
                        }

                        /* ── Horizontal Rule ── */
                        .blog-content hr {
                            border: none;
                            height: 1px;
                            background: hsl(var(--border));
                            margin: 2.5rem 0;
                        }

                        /* ── Images ── */
                        .blog-content img {
                            max-width: 100%;
                            height: auto;
                            border-radius: 0.75rem;
                            margin: 1.5rem 0;
                            display: block;
                        }

                        /* ── Tables ── */
                        .blog-content table {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 1.5rem 0;
                            font-size: 0.95rem;
                            overflow-x: auto;
                            display: block;
                        }
                        .blog-content th,
                        .blog-content td {
                            padding: 0.75rem 1rem;
                            text-align: left;
                            border-bottom: 1px solid hsl(var(--border));
                        }
                        .blog-content th {
                            font-weight: 600;
                            color: hsl(var(--foreground));
                            background: hsl(var(--muted) / 0.5);
                        }
                        .blog-content tr:hover td {
                            background: hsl(var(--muted) / 0.3);
                        }

                        /* ── Code ── */
                        .blog-content code {
                            background: hsl(var(--muted) / 0.5);
                            padding: 0.15rem 0.4rem;
                            border-radius: 0.25rem;
                            font-size: 0.9em;
                            font-family: ui-monospace, monospace;
                        }
                        .blog-content pre {
                            background: hsl(var(--muted) / 0.5);
                            padding: 1.25rem;
                            border-radius: 0.75rem;
                            overflow-x: auto;
                            margin: 1.5rem 0;
                        }
                        .blog-content pre code {
                            background: none;
                            padding: 0;
                        }

                        /* ── Responsive ── */
                        @media (max-width: 640px) {
                            .blog-content {
                                font-size: 1rem;
                            }
                            .blog-content h2 {
                                font-size: 1.3rem;
                                margin-top: 2rem;
                            }
                            .blog-content h3 {
                                font-size: 1.15rem;
                            }
                            .blog-content p,
                            .blog-content ul li,
                            .blog-content ol li {
                                font-size: 1rem;
                                line-height: 1.75;
                            }
                        }
                    `,
                }}
            />
        </>
    )
}

