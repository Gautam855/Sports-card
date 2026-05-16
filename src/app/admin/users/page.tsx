'use client'

import { useState, useEffect } from 'react'
import { 
    Loader2, 
    User, 
    Shield, 
    ShieldCheck, 
    Trash2, 
    Mail, 
    Calendar,
    Search,
    Filter,
    MoreVertical,
    UserPlus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/providers/AuthProvider'

interface UserProfile {
    id: string
    email: string
    username: string
    display_name: string | null
    role: string
    avatar_url: string | null
    created_at: string
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState('all')
    const { getToken } = useAuth()

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const token = getToken()
            const headers: Record<string, string> = {}
            if (token) headers['Authorization'] = `Bearer ${token}`

            const res = await fetch('/api/admin/users', { headers })
            const data = await res.json()
            setUsers(data.users || [])
        } catch (error) {
            console.error('Failed to fetch users', error)
        } finally {
            setLoading(false)
        }
    }

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            const token = getToken()
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            }
            if (token) headers['Authorization'] = `Bearer ${token}`

            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ id: userId, role: newRole })
            })
            if (res.ok) {
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
            }
        } catch (error) {
            console.error('Failed to update role', error)
        }
    }

    const handleDelete = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return

        try {
            const token = getToken()
            const headers: Record<string, string> = {}
            if (token) headers['Authorization'] = `Bearer ${token}`

            const res = await fetch(`/api/admin/users?id=${userId}`, { 
                method: 'DELETE',
                headers
            })
            if (res.ok) {
                setUsers(users.filter(u => u.id !== userId))
            }
        } catch (error) {
            console.error('Failed to delete user', error)
        }
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch = 
            (user.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
            (user.username?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
            (user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
        
        const matchesRole = roleFilter === 'all' || user.role === roleFilter
        
        return matchesSearch && matchesRole
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-display">User Management</h1>
                    <p className="text-muted-foreground text-sm">Monitor and manage registered users, roles, and account statuses.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Total: {users.length}
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 bg-card border border-border p-4 rounded-xl shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search by email, username or name..." 
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground ml-2" />
                    <select 
                        className="bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="all">All Roles</option>
                        <option value="admin">Admins</option>
                        <option value="user">Users</option>
                        <option value="editor">Editors</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
                            <tr>
                                <th className="px-6 py-4 font-semibold">User</th>
                                <th className="px-6 py-4 font-semibold">Role</th>
                                <th className="px-6 py-4 font-semibold">Joined Date</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-10 w-40 bg-muted rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 w-20 bg-muted rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-muted rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-8 w-8 bg-muted rounded ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                        <User className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        No users found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0 border border-primary/20">
                                                    {user.avatar_url ? (
                                                        <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="w-5 h-5 text-primary" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-foreground">{user.display_name || user.username}</div>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                                        <Mail className="w-3 h-3" />
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {user.role === 'admin' ? (
                                                    <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20 gap-1.5">
                                                        <ShieldCheck className="w-3 h-3" /> Admin
                                                    </Badge>
                                                ) : user.role === 'editor' ? (
                                                    <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20 gap-1.5">
                                                        <Shield className="w-3 h-3" /> Editor
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="gap-1.5 text-muted-foreground">
                                                        <User className="w-3 h-3" /> User
                                                    </Badge>
                                                )}
                                                
                                                <select 
                                                    className="opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity bg-transparent text-[10px] font-bold border-none cursor-pointer focus:ring-0"
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                >
                                                    <option value="user">User</option>
                                                    <option value="editor">Editor</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(user.created_at).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                                    onClick={() => handleDelete(user.id)}
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
