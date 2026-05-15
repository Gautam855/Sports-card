import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const response = NextResponse.next({ request })

    // Add security headers
    response.headers.set('X-Robots-Tag', 'index, follow')

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|icons|images|og-default.jpg).*)',
    ],
}