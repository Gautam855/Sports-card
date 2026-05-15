import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // Get the redirect query param, fallback to /
    const redirect = searchParams.get('redirect') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return NextResponse.redirect(`${origin}${redirect}`)
        }
    }

    // if there's an error, redirect to login
    return NextResponse.redirect(`${origin}/login?error=auth_error`)
}
