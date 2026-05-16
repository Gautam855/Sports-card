import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/admin/users — Fetch all users
 */
export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient()
        
        // Check authorization
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', authUser.id)
            .single()

        if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin' && profile.role !== 'editor')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
        
        // Fetch users from profiles table
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json({ users: data })
    } catch (err: any) {
        return NextResponse.json(
            { error: err?.message ?? 'Failed to fetch users' },
            { status: 500 }
        )
    }
}

/**
 * PATCH /api/admin/users — Update user role or data
 */
export async function PATCH(req: NextRequest) {
    try {
        const supabase = await createClient()
        
        // Check authorization
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', authUser.id)
            .single()

        if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin' && profile.role !== 'editor')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await req.json()
        const { id, role, display_name } = body

        if (!id) {
            return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
        }

        const updates: any = {}
        if (role) updates.role = role
        if (display_name) updates.display_name = display_name

        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ user: data })
    } catch (err: any) {
        return NextResponse.json(
            { error: err?.message ?? 'Failed to update user' },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/admin/users — Delete a user profile
 */
export async function DELETE(req: NextRequest) {
    try {
        const supabase = await createClient()

        // Check authorization
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', authUser.id)
            .single()

        if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin' && profile.role !== 'editor')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
        }

        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (err: any) {
        return NextResponse.json(
            { error: err?.message ?? 'Failed to delete user' },
            { status: 500 }
        )
    }
}
