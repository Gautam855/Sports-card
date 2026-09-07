import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Public, stateless Supabase client for read-only queries (news, blogs, categories, pages, site_scripts).
 * Does NOT access cookies() or headers(), allowing Next.js to cache queries with unstable_cache,
 * ISR, and static generation without bailing out of caching.
 */
let publicClient: any = null

export function getPublicClient(): any {
    if (!publicClient) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!url || !anonKey) {
            throw new Error('Supabase public credentials missing: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
        }

        publicClient = createSupabaseClient<any>(url, anonKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
        })
    }
    return publicClient
}
