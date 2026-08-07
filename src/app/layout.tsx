import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Space_Grotesk } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { Toaster } from 'sonner'
import { BreakingNewsTicker } from '@/components/layout/BreakingNewsTicker'
import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'
import { Footer } from '@/components/layout/Footer'
import { Analytics } from '@/components/Analytics'
import { DynamicScripts } from '@/components/seo/DynamicScripts'
import '../globals.css'
import { createClient } from '@/lib/supabase/server'

const spaceGrotesk = Space_Grotesk({
    subsets: ['latin'],
    variable: '--font-space-grotesk',
    display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
    // Fetch dynamic meta tags from database
    let dynamicOther: Record<string, string>[] = []
    let googleVerification: string | undefined = process.env.GOOGLE_SITE_VERIFICATION
    try {
        const supabase = await createClient()
        const { data } = await supabase
            .from('site_scripts')
            .select('slug, script_type, content, attributes')
            .eq('is_active', true)
            .in('script_type', ['meta'])
            .order('priority', { ascending: true })

        if (data) {
            for (const s of data) {
                if (s.attributes?.name === 'google-site-verification') {
                    googleVerification = s.content
                } else if (s.attributes?.name || s.attributes?.property) {
                    dynamicOther.push({
                        ...(s.attributes || {}),
                        content: s.content,
                    })
                }
            }
        }
    } catch {
        // Don't break the site if DB is unreachable
    }

    return {
        metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined,
        title: {
            default: 'SportsLNV — Match Predictions & Fantasy Tips',
            template: '%s | SportsLNV',
        },
        description:
            'Get expert match predictions, fantasy team tips, breaking news and player stats for Football, Cricket, Basketball, Tennis and more.',
        keywords: [
            'match prediction',
            'fantasy cricket', 'dream11 prediction', 'ipl 2025',
            'today match', 'playing 11', 'sports news',
        ],
        authors: [{ name: 'SportsLNV' }],
        creator: 'SportsLNV',
        publisher: 'SportsLNV Media',
        robots: {
            index: true,
            follow: true,
            googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
        },
        openGraph: {
            type: 'website',
            locale: 'en_US',
            url: process.env.NEXT_PUBLIC_SITE_URL,
            siteName: 'SportsLNV',
            title: 'SportsLNV — Match Predictions & Fantasy Tips',
            description:
                'Expert predictions, fantasy tips, and breaking sports news.',
            images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'SportsLNV' }],
        },
        twitter: {
            card: 'summary_large_image',
            site: '@SportsLNV',
            creator: '@SportsLNV',
        },
        alternates: {
            canonical: process.env.NEXT_PUBLIC_SITE_URL,
        },
        verification: {
            google: googleVerification,
        },
        other: Object.fromEntries(
            dynamicOther.map(m => [m.name || m.property || 'custom', m.content])
        ),
    }
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#ffffff' },
        { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
    ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={`${GeistSans.variable} ${GeistMono.variable} ${spaceGrotesk.variable}`}
        >
            <head>
                {/* Google Tag Manager */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-NZG52CQZ');`
                    }}
                />
                {/* End Google Tag Manager */}

                {/* Google tag (gtag.js) */}
                <script async src="https://www.googletagmanager.com/gtag/js?id=G-03R981P0Y8"></script>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-03R981P0Y8');`
                    }}
                />

                <Script
                    async
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4573815949018090"
                    crossOrigin="anonymous"
                    strategy="afterInteractive"
                />
                {/* Meta Pixel Code */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '3296516970531633');
fbq('track', 'PageView');`
                    }}
                />
                {/* End Meta Pixel Code */}

                {/* Google Tag Manager (noscript) */}
                <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NZG52CQZ"
                height="0" width="0" style={{display:"none", visibility:"hidden"}}></iframe></noscript>
                {/* End Google Tag Manager (noscript) */}
                {/* Meta Pixel Code (noscript) */}
                <noscript><img height="1" width="1" style={{ display: 'none' }} src="https://www.facebook.com/tr?id=3296516970531633&ev=PageView&noscript=1" alt="" /></noscript>
                {/* End Meta Pixel Code (noscript) */}
            </head>
            <body className="min-h-screen bg-background font-sans antialiased">
                <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
                    <QueryProvider>
                        <AuthProvider>
                            <BreakingNewsTicker />
                            <Header />
                            <main className="min-h-[calc(100vh-64px)] pb-16 md:pb-0">
                                {children}
                            </main>
                            <Footer />
                            <MobileNav />
                            <Toaster
                                position="top-right"
                                toastOptions={{
                                    classNames: {
                                        toast: 'bg-card border-border text-foreground',
                                        error: 'border-red-500/50',
                                        success: 'border-green-500/50',
                                    },
                                }}
                            />
                        </AuthProvider>
                    </QueryProvider>
                </ThemeProvider>
                <Analytics />
                <DynamicScripts />
            </body>
        </html>
    )
}