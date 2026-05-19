import type { Metadata, Viewport } from 'next'
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

const spaceGrotesk = Space_Grotesk({
    subsets: ['latin'],
    variable: '--font-space-grotesk',
    display: 'swap',
})

export const metadata: Metadata = {
    metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined,
    title: {
        default: 'SportsPulse — Live Scores, Predictions & Fantasy Tips',
        template: '%s | SportsPulse',
    },
    description:
        'Get live sports scores, expert match predictions, fantasy team tips, breaking news and player stats for Football, Cricket, Basketball, Tennis and more.',
    keywords: [
        'live scores', 'cricket live score', 'football live score', 'match prediction',
        'fantasy cricket', 'dream11 prediction', 'ipl 2025', 'premier league scores',
        'today match', 'playing 11', 'sports news',
    ],
    authors: [{ name: 'SportsPulse' }],
    creator: 'SportsPulse',
    publisher: 'SportsPulse Media',
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: process.env.NEXT_PUBLIC_SITE_URL,
        siteName: 'SportsPulse',
        title: 'SportsPulse — Live Scores, Predictions & Fantasy Tips',
        description:
            'Live scores, expert predictions, fantasy tips, and breaking sports news.',
        images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'SportsPulse' }],
    },
    twitter: {
        card: 'summary_large_image',
        site: '@SportsPulse',
        creator: '@SportsPulse',
    },
    alternates: {
        canonical: process.env.NEXT_PUBLIC_SITE_URL,
    },
    verification: {
        google: process.env.GOOGLE_SITE_VERIFICATION,
    },
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