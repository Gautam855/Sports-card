'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import {
    LayoutDashboard, Users, Bell, Zap, ChevronRight, LogOut,
    PenTool, ShoppingBag, Code2, Key, Activity,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NAV_ITEMS = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Blogs', href: '/admin/blogs', icon: PenTool },
    { label: 'Merchandise', href: '/admin/merchandise', icon: ShoppingBag },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'SEO & Scripts', href: '/admin/seo-scripts', icon: Code2 },
    { label: 'API Keys', href: '/admin/api-keys', icon: Key },
    { label: 'API Status', href: '/admin/api-status', icon: Activity },
    { label: 'Notifications', href: '/admin/notifications', icon: Bell },
]


interface AdminSidebarProps {
    profile: { username: string; display_name?: string; avatar_url?: string; role: string }
}

export function AdminSidebar({ profile }: AdminSidebarProps) {
    const pathname = usePathname()
    const router = useRouter()

    async function handleLogout() {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/')
    }

    return (
        <aside className="w-64 flex-shrink-0 border-r border-border bg-card/50 flex flex-col min-h-screen sticky top-0">
            {/* Logo */}
            <div className="p-6 border-b border-border">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" fill="white" />
                    </div>
                    <span className="font-display font-bold">SportsLNV</span>
                </Link>
                <div className="mt-1 text-xs text-muted-foreground">Admin Panel</div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group',
                                isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                            )}
                        >
                            <item.icon className="w-4 h-4 flex-shrink-0" />
                            <span className="flex-1">{item.label}</span>
                            {isActive && <ChevronRight className="w-3 h-3 opacity-60" />}
                        </Link>
                    )
                })}
            </nav>

            {/* Profile */}
            <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3 mb-3">
                    {profile.avatar_url ? (
                        <Image src={profile.avatar_url} alt={profile.username} width={36} height={36} className="rounded-full" />
                    ) : (
                        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center font-bold text-sm">
                            {(profile.display_name ?? profile.username)[0].toUpperCase()}
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{profile.display_name ?? profile.username}</p>
                        <p className="text-xs text-muted-foreground capitalize">{profile.role}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </aside>
    )
}