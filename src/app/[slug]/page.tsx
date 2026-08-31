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
        title: page.meta_title || page.title,
        description: page.meta_description || `${page.title} — SportsLNV`,
        alternates: {
            canonical: `${siteUrl}/${page.slug}`,
        },
        openGraph: {
            title: page.meta_title || page.title,
            description: page.meta_description || `${page.title} — SportsLNV`,
            url: `${siteUrl}/${page.slug}`,
            type: 'website',
        },
    }
}

export default async function CustomPage({ params }: PageParams) {
    const { slug } = await params
    const page = await getPage(slug)

    if (!page) {
        notFound()
    }

    return (
        <div className="custom-page">
            {/* Page title for accessibility / structure */}
            <h1 className="sr-only">{page.title}</h1>

            {/* Render the custom HTML content */}
            <div
                className="custom-page-content"
                dangerouslySetInnerHTML={{ __html: page.html_content }}
            />

            {/* Scoped styles for custom page content */}
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                        .custom-page-content {
                            width: 100%;
                        }
                        .custom-page-content img {
                            max-width: 100%;
                            height: auto;
                        }
                        .custom-page-content a {
                            color: hsl(var(--primary));
                        }
                        .custom-page-content a:hover {
                            text-decoration: underline;
                        }
                    `,
                }}
            />
        </div>
    )
}
