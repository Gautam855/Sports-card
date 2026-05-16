'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Loader2 } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, isAdmin } = useAuth()
    const router = useRouter()
    const [checked, setChecked] = useState(false)

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login?redirect=/admin')
            } else if (!isAdmin) {
                // If logged in but not admin, kick to home
                router.push('/')
            } else {
                setChecked(true)
            }
        }
    }, [user, loading, isAdmin, router])

    if (loading || !checked) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading admin panel...</p>
                </div>
            </div>
        )
    }

    const safeProfile = {
        username: user?.username || user?.email?.split('@')[0] || 'Admin',
        display_name: user?.display_name || user?.username || 'Admin',
        role: user?.role || 'user',
        avatar_url: user?.avatar_url || '',
    }

    return (
        <div className="flex min-h-screen bg-background">
            <AdminSidebar profile={safeProfile} />
            <main className="flex-1 overflow-auto">
                <div className="p-6 md:p-8">{children}</div>
            </main>
        </div>
    )
}