import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyToken } from '@/lib/auth'

export async function verifyAdmin(req: NextRequest) {
    // 1. Try to get token from Authorization header
    const authHeader = req.headers.get('Authorization')
    let userId: string | null = null
    let role: string | null = null

    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1]
        const decoded = await verifyToken(token)
        if (decoded) {
            userId = decoded.userId
            role = decoded.role
        }
    }

    // 2. Fallback to Supabase auth (for browser sessions if any)
    if (!userId) {
        const supabase = await createClient()
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
            userId = authUser.id
            // Fetch role from profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single()
            if (profile) role = profile.role
        }
    }

    if (!userId || !role) {
        return { error: 'Unauthorized', status: 401 }
    }

    const isAdmin = role === 'admin' || role === 'super_admin' || role === 'editor'
    if (!isAdmin) {
        return { error: 'Forbidden', status: 403 }
    }

    return { userId, role }
}
