import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Space_Grotesk } from 'next/font/google'
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
            default: 'SportsLNV — Sports News & Blogs',
            template: '%s | SportsLNV',
        },
        description:
            'Get breaking sports news, expert analysis, player stories and premium sports blogs for Football, Cricket, Basketball, Tennis and more.',
        keywords: [
            'sports news',
            'sports blog',
            'football news', 'cricket news', 'basketball news',
            'sports analysis', 'breaking sports news',
        ],
        authors: [{ name: 'SportsLNV' }],
        creator: 'SportsLNV',
        publisher: 'SportsLNV Media',
        robots: {
            index: true,
            follow: true,
            googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
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
    themeColor: '#2563eb',
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
                <Script id="gtm-init"
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
                <Script id="gtag-url" async src="https://www.googletagmanager.com/gtag/js?id=G-03R981P0Y8"></Script>
                <Script id="gtag-init"
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
                <Script id="meta-pixel"
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

                {/* LaraPush Push Notification Integration */}
                <Script
                    id="larapush-sdk"
                    src="https://cdn.larapush.com/scripts/popup-4.0.0.min.js"
                    strategy="afterInteractive"
                />
                <Script
                    id="larapush-init"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `function LoadLaraPush(){ if (typeof LaraPush === "function") {new LaraPush(JSON.parse(atob('eyJmaXJlYmFzZUNvbmZpZyI6eyJwcm9qZWN0SWQiOiJzcG9ydHNsbnYiLCJtZXNzYWdpbmdTZW5kZXJJZCI6IjQyODY3NTkxNDczNCIsImFwcElkIjoiMTo0Mjg2NzU5MTQ3MzQ6d2ViOmVjOTFhNWRkY2I2NGY4MTUyZTRjZmYiLCJhcGlLZXkiOiJBSXphU3lDN0pfMVJfWk9BMlV0RFBTMVkxeFdOcm03TjIyd2plU3MifSwiZG9tYWluIjoic3BvcnRzbG52LmNvbSIsInNpdGVfdXJsIjoiaHR0cHM6XC9cL3Nwb3J0c2xudi5jb21cLyIsImFwaV91cmwiOiJodHRwczpcL1wvc3RvY2tzdGJpdC5sYXJhcHUuc2hcL2FwaVwvdG9rZW4iLCJzZXJ2aWNlV29ya2VyIjoiaHR0cHM6XC9cL3Nwb3J0c2xudi5jb21cL2ZpcmViYXNlLW1lc3NhZ2luZy1zdy5qcyIsInZhcGlkX3B1YmxpY19rZXkiOiJCSHdWaThLVHI3ZlNoX0lBWWN4YVpXVm00OVpPYUNPNVFlcjRxcnBXTW5CRzF6Q0V5YUhjYWtySTRjWE9KQTFWM2V1V2g0bXBIWTdjMkliR1k1cTh1OE0iLCJyZWZlcnJhbENvZGUiOiJFQllTTUIifQ==')), JSON.parse(atob('eyJsb2dvIjpudWxsLCJoZWFkaW5nIjpudWxsLCJzdWJoZWFkaW5nIjpudWxsLCJ0aGVtZUNvbG9yIjoiIzAwMDAwMCIsImFsbG93VGV4dCI6bnVsbCwiZGVueVRleHQiOm51bGwsImRlc2t0b3AiOiJkaXNhYmxlIiwibW9iaWxlIjoiZGlzYWJsZSIsIm1vYmlsZUxvY2F0aW9uIjoiYm90dG9tIiwiZGVsYXkiOiIwIiwicmVhcHBlYXIiOiIwIiwiYm90dG9tQnV0dG9uIjoiZGlzYWJsZSIsImJ1dHRvblRvVW5zdWJzY3JpYmUiOiJkaXNhYmxlIiwibG9ja1BhZ2VDb250ZW50IjoiZGlzYWJsZSIsImJhY2tkcm9wIjoiZW5hYmxlIiwicG9wdXBfdHlwZSI6ImRlZmF1bHQtcHJvbXB0In0=')));}}LoadLaraPush();`
                    }}
                />
                {/* End LaraPush */}
            </head>
            <body className="bg-white font-sans antialiased overflow-x-hidden flex flex-col min-h-dvh">
                <QueryProvider>
                    <AuthProvider>
                        <BreakingNewsTicker />
                        <Header />
                        <main className="flex-1">
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
                <Analytics />
                <DynamicScripts />
            </body>
        </html>
    )
}