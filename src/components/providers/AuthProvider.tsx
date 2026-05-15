'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'

interface User {
    id: string
    email: string
    username: string
    display_name?: string
    avatar_url?: string
    role: string
}

interface AuthContextType {
    user: User | null
    loading: boolean
    isAdmin: boolean
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
    signup: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string }>
    logout: () => void
    getToken: () => string | null
}

const AuthContext = createContext<AuthContextType | null>(null)

const TOKEN_KEY = 'sp_auth_token'
const USER_KEY = 'sp_auth_user'

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    // Load user from localStorage on mount
    useEffect(() => {
        const token = localStorage.getItem(TOKEN_KEY)
        const savedUser = localStorage.getItem(USER_KEY)

        if (token && savedUser) {
            try {
                const parsed = JSON.parse(savedUser)
                setUser(parsed)
            } catch {
                localStorage.removeItem(TOKEN_KEY)
                localStorage.removeItem(USER_KEY)
            }

            // Verify token is still valid in background
            fetch('/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then(res => res.json())
                .then(data => {
                    if (data.user) {
                        setUser(data.user)
                        localStorage.setItem(USER_KEY, JSON.stringify(data.user))
                    } else {
                        // Token expired or invalid
                        setUser(null)
                        localStorage.removeItem(TOKEN_KEY)
                        localStorage.removeItem(USER_KEY)
                    }
                })
                .catch(() => {
                    // Network error — keep cached user
                })
                .finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [])

    const login = useCallback(async (email: string, password: string) => {
        try {
            const res = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                return { success: false, error: data.error || 'Login failed' }
            }

            // Store token and user in localStorage
            localStorage.setItem(TOKEN_KEY, data.token)
            localStorage.setItem(USER_KEY, JSON.stringify(data.user))
            setUser(data.user)

            return { success: true }
        } catch (err: any) {
            return { success: false, error: 'Network error. Please try again.' }
        }
    }, [])

    const signup = useCallback(async (email: string, password: string, username: string) => {
        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, username }),
            })

            const data = await res.json()

            if (!res.ok) {
                return { success: false, error: data.error || 'Signup failed' }
            }

            // Store token and user in localStorage
            localStorage.setItem(TOKEN_KEY, data.token)
            localStorage.setItem(USER_KEY, JSON.stringify(data.user))
            setUser(data.user)

            return { success: true }
        } catch (err: any) {
            return { success: false, error: 'Network error. Please try again.' }
        }
    }, [])

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        setUser(null)
    }, [])

    const getToken = useCallback(() => {
        return localStorage.getItem(TOKEN_KEY)
    }, [])

    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'editor'

    return (
        <AuthContext.Provider value={{ user, loading, isAdmin, login, signup, logout, getToken }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

// Legacy export for backward compatibility
export const useAuthStore = {
    getState: () => {
        if (typeof window === 'undefined') return { user: null, profile: null, loading: true }
        const savedUser = localStorage.getItem(USER_KEY)
        const parsed = savedUser ? JSON.parse(savedUser) : null
        return {
            user: parsed ? { id: parsed.id, email: parsed.email } : null,
            profile: parsed,
            loading: false,
        }
    },
}