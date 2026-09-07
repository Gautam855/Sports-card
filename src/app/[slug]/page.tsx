import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

interface PageParams {
    params: Promise<{ slug: string }>
}

async function getPage(slug: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('custom_pages')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single()

    if (error || !data) return null
    return data
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
    const { slug } = await params
    const page = await getPage(slug)

    if (!page) {
        return { title: 'Page Not Found' }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sportslnv.com'

    return {
        title: page.meta_title || page.page_title || page.title,
        description: page.meta_description || `${page.page_title || page.title} — SportsLNV`,
        alternates: {
            canonical: `${siteUrl}/${page.slug}`,
        },
        openGraph: {
            title: page.meta_title || page.page_title || page.title,
            description: page.meta_description || `${page.page_title || page.title} — SportsLNV`,
            url: `${siteUrl}/${page.slug}`,
            type: 'website',
            ...(page.banner_image ? {
                images: [{ url: page.banner_image, width: 1200, height: 630, alt: page.page_title || page.title }],
            } : {}),
        },
    }
}

export default async function CustomPage({ params }: PageParams) {
    const { slug } = await params
    const page = await getPage(slug)

    if (!page) {
        notFound()
    }

    const displayTitle = page.page_title || page.title

    return (
        <div className="custom-page">
            {/* Banner Image */}
            {page.banner_image && (
                <div className="custom-page-banner">
                    <img
                        src={page.banner_image}
                        alt={displayTitle}
                        className="custom-page-banner-img"
                    />
                    <div className="custom-page-banner-overlay" />
                </div>
            )}

            {/* Page Title */}
            <div className={page.banner_image ? 'custom-page-header with-banner' : 'custom-page-header'}>
                <h1 className="custom-page-title">{displayTitle}</h1>
            </div>

            {/* Render the custom HTML content */}
            <div
                className="custom-page-content"
                dangerouslySetInnerHTML={{ __html: page.html_content }}
            />

            {/* Scoped styles for custom page content */}
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                        .custom-page {
                            width: 100%;
                        }

                        /* ── Banner ── */
                        .custom-page-banner {
                            position: relative;
                            width: 100%;
                            max-height: 420px;
                            overflow: hidden;
                            border-radius: 0 0 1.5rem 1.5rem;
                        }
                        .custom-page-banner-img {
                            width: 100%;
                            height: 100%;
                            min-height: 200px;
                            max-height: 420px;
                            object-fit: cover;
                            display: block;
                        }
                        .custom-page-banner-overlay {
                            position: absolute;
                            inset: 0;
                            background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%);
                            pointer-events: none;
                        }

                        /* ── Page Header ── */
                        .custom-page-header {
                            max-width: 860px;
                            margin: 0 auto;
                            padding: 2rem 1.5rem 0.5rem;
                        }
                        .custom-page-header.with-banner {
                            margin-top: -3rem;
                            position: relative;
                            z-index: 1;
                        }
                        .custom-page-title {
                            font-size: 2rem;
                            font-weight: 800;
                            line-height: 1.2;
                            letter-spacing: -0.02em;
                            color: hsl(var(--foreground));
                        }
                        .custom-page-header.with-banner .custom-page-title {
                            color: white;
                            text-shadow: 0 2px 8px rgba(0,0,0,0.4);
                        }
                        @media (min-width: 768px) {
                            .custom-page-title {
                                font-size: 2.5rem;
                            }
                        }

                        /* ── Content Container ── */
                        .custom-page-content {
                            width: 100%;
                            max-width: 860px;
                            margin: 0 auto;
                            padding: 1.5rem 1.5rem 4rem;
                            font-size: 1.0625rem;
                            line-height: 1.8;
                            color: hsl(var(--foreground));
                            word-wrap: break-word;
                            overflow-wrap: break-word;
                        }

                        /* ── Headings ── */
                        .custom-page-content h2 {
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
                        .custom-page-content h2::before {
                            content: '';
                            position: absolute;
                            bottom: -3px;
                            left: 0;
                            width: 60px;
                            height: 3px;
                            background: hsl(var(--primary));
                            border-radius: 2px;
                        }
                        .custom-page-content h3 {
                            font-size: 1.25rem;
                            font-weight: 700;
                            line-height: 1.35;
                            margin-top: 2rem;
                            margin-bottom: 0.75rem;
                            color: hsl(var(--foreground));
                        }
                        .custom-page-content h4 {
                            font-size: 1.1rem;
                            font-weight: 600;
                            margin-top: 1.5rem;
                            margin-bottom: 0.5rem;
                            color: hsl(var(--foreground));
                        }

                        /* ── Paragraphs ── */
                        .custom-page-content p {
                            margin-bottom: 1.15rem;
                            color: hsl(var(--muted-foreground));
                            font-size: 1.0625rem;
                            line-height: 1.85;
                        }
                        .custom-page-content p:last-child {
                            margin-bottom: 0;
                        }

                        /* ── Line Breaks — reduce excessive spacing from <br /> ── */
                        .custom-page-content br {
                            display: block;
                            content: '';
                            margin-top: 0.25rem;
                        }

                        /* ── Links ── */
                        .custom-page-content a {
                            color: hsl(var(--primary));
                            text-decoration: none;
                            font-weight: 500;
                            border-bottom: 1px solid hsl(var(--primary) / 0.3);
                            transition: border-color 0.2s ease, color 0.2s ease;
                        }
                        .custom-page-content a:hover {
                            color: hsl(var(--primary));
                            border-bottom-color: hsl(var(--primary));
                        }

                        /* ── Lists ── */
                        .custom-page-content ul,
                        .custom-page-content ol {
                            margin: 1.25rem 0;
                            padding-left: 0;
                            list-style: none;
                        }
                        .custom-page-content ul li {
                            position: relative;
                            padding-left: 1.75rem;
                            margin-bottom: 0.65rem;
                            color: hsl(var(--muted-foreground));
                            font-size: 1.0625rem;
                            line-height: 1.75;
                        }
                        .custom-page-content ul li::before {
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
                        .custom-page-content ol {
                            counter-reset: list-counter;
                        }
                        .custom-page-content ol li {
                            position: relative;
                            padding-left: 2rem;
                            margin-bottom: 0.65rem;
                            color: hsl(var(--muted-foreground));
                            font-size: 1.0625rem;
                            line-height: 1.75;
                            counter-increment: list-counter;
                        }
                        .custom-page-content ol li::before {
                            content: counter(list-counter) '.';
                            position: absolute;
                            left: 0;
                            top: 0;
                            font-weight: 700;
                            color: hsl(var(--primary));
                            font-size: 1rem;
                        }

                        /* ── Strong / Bold ── */
                        .custom-page-content strong,
                        .custom-page-content b {
                            font-weight: 600;
                            color: hsl(var(--foreground));
                        }

                        /* ── Emphasis ── */
                        .custom-page-content em,
                        .custom-page-content i {
                            font-style: italic;
                        }

                        /* ── Blockquote ── */
                        .custom-page-content blockquote {
                            margin: 1.75rem 0;
                            padding: 1.25rem 1.5rem;
                            border-left: 4px solid hsl(var(--primary));
                            background: hsl(var(--muted) / 0.4);
                            border-radius: 0 0.75rem 0.75rem 0;
                            font-style: italic;
                            color: hsl(var(--muted-foreground));
                        }
                        .custom-page-content blockquote p {
                            margin-bottom: 0.5rem;
                        }
                        .custom-page-content blockquote p:last-child {
                            margin-bottom: 0;
                        }

                        /* ── Horizontal Rule ── */
                        .custom-page-content hr {
                            border: none;
                            height: 1px;
                            background: hsl(var(--border));
                            margin: 2.5rem 0;
                        }

                        /* ── Images inside content ── */
                        .custom-page-content img {
                            max-width: 100%;
                            height: auto;
                            border-radius: 0.75rem;
                            margin: 1.5rem 0;
                            display: block;
                        }

                        /* ── Tables ── */
                        .custom-page-content table {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 1.5rem 0;
                            font-size: 0.95rem;
                            overflow-x: auto;
                            display: block;
                        }
                        .custom-page-content th,
                        .custom-page-content td {
                            padding: 0.75rem 1rem;
                            text-align: left;
                            border-bottom: 1px solid hsl(var(--border));
                        }
                        .custom-page-content th {
                            font-weight: 600;
                            color: hsl(var(--foreground));
                            background: hsl(var(--muted) / 0.5);
                        }
                        .custom-page-content tr:hover td {
                            background: hsl(var(--muted) / 0.3);
                        }

                        /* ── Code ── */
                        .custom-page-content code {
                            background: hsl(var(--muted) / 0.5);
                            padding: 0.15rem 0.4rem;
                            border-radius: 0.25rem;
                            font-size: 0.9em;
                            font-family: ui-monospace, monospace;
                        }
                        .custom-page-content pre {
                            background: hsl(var(--muted) / 0.5);
                            padding: 1.25rem;
                            border-radius: 0.75rem;
                            overflow-x: auto;
                            margin: 1.5rem 0;
                        }
                        .custom-page-content pre code {
                            background: none;
                            padding: 0;
                        }

                        /* ── Responsive ── */
                        @media (max-width: 640px) {
                            .custom-page-content {
                                padding: 1rem 1rem 3rem;
                                font-size: 1rem;
                            }
                            .custom-page-content h2 {
                                font-size: 1.3rem;
                                margin-top: 2rem;
                            }
                            .custom-page-content h3 {
                                font-size: 1.15rem;
                            }
                            .custom-page-content p,
                            .custom-page-content ul li,
                            .custom-page-content ol li {
                                font-size: 1rem;
                                line-height: 1.75;
                            }
                            .custom-page-header {
                                padding: 1.5rem 1rem 0.5rem;
                            }
                        }
                    `,
                }}
            />
        </div>
    )
}
