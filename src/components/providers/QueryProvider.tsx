'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

if (typeof window !== 'undefined') {
    const originalFetch = window.fetch
    const clientCache = new Map<string, { data: any; timestamp: number }>()
    const CLIENT_CACHE_TTL = 30 * 1000 // 30 seconds hard cache on the client

    window.fetch = async function (input, init) {
        const urlStr = typeof input === 'string' ? input : (input instanceof URL ? input.toString() : input?.url || '')
        
        // We only cache GET requests to internal match APIs (/api/matches and /api/live)
        const isTarget = urlStr.includes('/api/matches') || urlStr.includes('/api/live')
        const isGet = !init || !init.method || init.method.toUpperCase() === 'GET'

        if (isTarget && isGet) {
            // Check memory cache first
            let cached = clientCache.get(urlStr)
            
            // Fallback to sessionStorage if memory cache is empty
            if (!cached) {
                try {
                    const sessionData = sessionStorage.getItem(`cache:${urlStr}`)
                    if (sessionData) {
                        cached = JSON.parse(sessionData)
                    }
                } catch (_) {}
            }

            if (cached && (Date.now() - cached.timestamp) < CLIENT_CACHE_TTL) {
                console.log(
                    `%c[Client Cache HIT] %c${urlStr}`,
                    'color: #10B981; font-weight: bold; padding: 2px 4px; background: rgba(16, 185, 129, 0.1); border-radius: 4px;',
                    'color: #9CA3AF;'
                )
                return new Response(JSON.stringify(cached.data), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json', 'X-Client-Cache': 'HIT' }
                })
            }

            const response = await originalFetch(input, init)
            if (response.ok) {
                try {
                    const clonedRes = response.clone()
                    const data = await clonedRes.json()
                    const entry = { data, timestamp: Date.now() }
                    
                    // Update memory cache
                    clientCache.set(urlStr, entry)
                    
                    // Update sessionStorage
                    try {
                        sessionStorage.setItem(`cache:${urlStr}`, JSON.stringify(entry))
                    } catch (_) {}
                } catch (_) {}
            }
            return response
        }

        return originalFetch(input, init)
    }
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [client] = useState(
        () => new QueryClient({
            defaultOptions: {
                queries: {
                    staleTime: 1000 * 60 * 2, // 2 minutes
                    gcTime: 1000 * 60 * 10,  // 10 minutes
                    retry: 2,
                    refetchOnWindowFocus: false,
                },
            },
        })
    )

    return (
        <QueryClientProvider client={client}>
            {children}
            {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
    )
}