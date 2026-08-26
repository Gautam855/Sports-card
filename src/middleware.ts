import { NextResponse, type NextRequest } from 'next/server'

const SITE_HOST = process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname
    : 'sportslnv.com'

export async function middleware(request: NextRequest) {
    const url = request.nextUrl
    const pathname = url.pathname

    // Canonical host: redirect www → apex (301)
    if (url.hostname === `www.${SITE_HOST}`) {
        const canonical = new URL(url)
        canonical.hostname = SITE_HOST
        canonical.protocol = 'https:'
        return NextResponse.redirect(canonical, 301)
    }

    // Force HTTPS on production apex domain
    if (
        url.hostname === SITE_HOST &&
        url.protocol === 'http:' &&
        process.env.NODE_ENV === 'production'
    ) {
        const httpsUrl = new URL(url)
        httpsUrl.protocol = 'https:'
        return NextResponse.redirect(httpsUrl, 301)
    }

    // Legacy WordPress PHP endpoints
    if (/^\/wp-.*\.php$/i.test(pathname)) {
        return NextResponse.redirect(new URL('/', request.url), 301)
    }

    // WooCommerce / WordPress AJAX query strings on homepage
    if (pathname === '/' && url.searchParams.has('wc-ajax')) {
        return NextResponse.redirect(new URL('/', request.url), 301)
    }

    const response = NextResponse.next({ request })
    response.headers.set('X-Robots-Tag', 'index, follow')
    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|icons|images|og-default.jpg|ads.txt).*)',
    ],
}
