/**
 * 301 redirects for legacy WordPress / old site URLs.
 * Used by next.config.ts — more specific rules must come first.
 */

export type LegacyRedirect = {
    source: string
    destination: string
    permanent: boolean
}

export const legacyRedirects: LegacyRedirect[] = [
    // ── Specific legacy pages → new routes ──
    { source: '/index.php/privacy-policy', destination: '/privacy', permanent: true },
    { source: '/index.php/privacy-policy/', destination: '/privacy', permanent: true },
    { source: '/index.php/editorial-policy', destination: '/terms', permanent: true },
    { source: '/index.php/editorial-policy/', destination: '/terms', permanent: true },
    { source: '/index.php/respnsible-gambling', destination: '/terms', permanent: true },
    { source: '/index.php/respnsible-gambling/', destination: '/terms', permanent: true },

    { source: '/index.php/category/blog', destination: '/blog', permanent: true },
    { source: '/index.php/category/blog/', destination: '/blog', permanent: true },
    { source: '/index.php/category/blog/feed', destination: '/blog', permanent: true },
    { source: '/index.php/category/sports-news', destination: '/news', permanent: true },
    { source: '/index.php/category/sports-news/', destination: '/news', permanent: true },
    { source: '/index.php/category/cricket', destination: '/sport/cricket', permanent: true },
    { source: '/index.php/category/cricket/', destination: '/sport/cricket', permanent: true },
    { source: '/index.php/category/cricket/feed', destination: '/sport/cricket', permanent: true },
    { source: '/index.php/category/futbol', destination: '/sport/football', permanent: true },
    { source: '/index.php/category/futbol/', destination: '/sport/football', permanent: true },
    { source: '/index.php/category/nfl', destination: '/sport/nfl', permanent: true },
    { source: '/index.php/category/nfl/', destination: '/sport/nfl', permanent: true },

    // ── Removed live-score routes ──
    { source: '/live', destination: '/', permanent: true },
    { source: '/matches', destination: '/', permanent: true },
    { source: '/predictions', destination: '/', permanent: true },
    { source: '/predictions/:path*', destination: '/', permanent: true },
    { source: '/fantasy', destination: '/', permanent: true },
    { source: '/fantasy/:path*', destination: '/', permanent: true },
    { source: '/arbitrage', destination: '/', permanent: true },
    { source: '/arbitrage/:path*', destination: '/', permanent: true },
    { source: '/score/:path*', destination: '/', permanent: true },

    // ── Sport hub (old /sport → /sports landing) ──
    { source: '/sport', destination: '/sports', permanent: true },

    // ── WordPress system paths ──
    { source: '/index.php/about', destination: '/', permanent: true },
    { source: '/index.php/about/', destination: '/', permanent: true },
    { source: '/index.php/about-author', destination: '/', permanent: true },
    { source: '/index.php/about-author/', destination: '/', permanent: true },
    { source: '/index.php/home', destination: '/', permanent: true },
    { source: '/index.php/home/', destination: '/', permanent: true },
    { source: '/index.php/homepage', destination: '/', permanent: true },
    { source: '/index.php/homepage/', destination: '/', permanent: true },
    { source: '/index.php/cart', destination: '/', permanent: true },
    { source: '/index.php/cart/', destination: '/', permanent: true },
    { source: '/index.php/search/:path*', destination: '/', permanent: true },

    { source: '/wp-admin', destination: '/', permanent: true },
    { source: '/wp-admin/:path*', destination: '/', permanent: true },
    { source: '/wp-content/:path*', destination: '/', permanent: true },
    { source: '/wp-sitemap.xml', destination: '/', permanent: true },
    { source: '/wp-login.php', destination: '/', permanent: true },

    // ── Catch-all legacy WordPress permalinks ──
    { source: '/index.php', destination: '/', permanent: true },
    { source: '/index.php/:path*', destination: '/', permanent: true },

    // ── Legacy tag / category / feed paths (without index.php prefix) ──
    { source: '/tag/:path*', destination: '/', permanent: true },
    { source: '/category/:path*', destination: '/', permanent: true },
    { source: '/feed', destination: '/', permanent: true },
    { source: '/feed/:path*', destination: '/', permanent: true },
    { source: '/cart', destination: '/', permanent: true },
    { source: '/home', destination: '/', permanent: true },
    { source: '/homepage', destination: '/', permanent: true },
]
