'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

interface Props {
    slotId?: string
    className?: string
}

export function AdSenseSlot({ slotId, className }: Props) {
    const adRef = useRef<HTMLModElement>(null)
    const pathname = usePathname()

    useEffect(() => {
        try {
            if (adRef.current && !adRef.current.hasAttribute('data-adsbygoogle-status')) {
                ;(window as any).adsbygoogle = (window as any).adsbygoogle || []
                ;(window as any).adsbygoogle.push({})
            }
        } catch (err) {
            console.error('AdSense error:', err)
        }
    }, [pathname])

    return (
        <div className={`my-8 w-full bg-muted/10 border border-border/50 rounded-xl overflow-hidden min-h-[100px] flex items-center justify-center relative ${className || ''}`}>
            <ins
                ref={adRef}
                className="adsbygoogle w-full"
                style={{ display: 'block', textAlign: 'center' }}
                data-ad-layout="in-article"
                data-ad-format="fluid"
                data-ad-client="ca-pub-4573815949018090"
                data-ad-slot={slotId || undefined}
            />
            <span className="text-xs text-muted-foreground absolute z-[-1]">Advertisement</span>
        </div>
    )
}
