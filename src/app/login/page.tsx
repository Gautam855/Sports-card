'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Zap, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectUrl = searchParams.get('redirect') || '/'
    const { login } = useAuth()

    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        const { success, error } = await login(email, password)

        if (!success) {
            toast.error(error || 'Login failed')
            setIsLoading(false)
            return
        }

        toast.success('Logged in successfully!')
        router.push(redirectUrl)
        router.refresh()
    }

    return (
        <div className="w-full max-w-sm space-y-6">
            <div className="flex flex-col items-center space-y-2 text-center">
                <Link href="/" className="flex items-center gap-2 mb-4">
                    <div className="relative w-10 h-10">
                        <div className="absolute inset-0 bg-brand-500 rounded-xl rotate-6" />
                        <div className="absolute inset-0 bg-brand-600 rounded-xl flex items-center justify-center">
                            <Zap className="w-6 h-6 text-white" fill="white" />
                        </div>
                    </div>
                </Link>
                <h1 className="text-2xl font-bold font-display">Welcome Back</h1>
                <p className="text-sm text-muted-foreground">
                    Enter your credentials to access your account
                </p>
            </div>

            <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
                <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                            id="email" 
                            type="email" 
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input 
                            id="password" 
                            type="password" 
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <Button 
                        className="w-full bg-brand-600 hover:bg-brand-500 text-white" 
                        type="submit" 
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Sign In
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-muted-foreground">Don&apos;t have an account? </span>
                    <Link href={`/register?redirect=${encodeURIComponent(redirectUrl)}`} className="font-medium text-brand-500 hover:text-brand-400">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-background">
            <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-brand-500" />}>
                <LoginForm />
            </Suspense>
        </div>
    )
}
