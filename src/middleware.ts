import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const url = request.nextUrl
    const pathname = url.pathname

    // Host / HTTPS canonicalization is handled by Vercel — do not redirect here
    // (www ↔ apex redirects in middleware caused ERR_TOO_MANY_REDIRECTS)

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
