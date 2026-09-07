'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

interface AdProps {
    className?: string
}

/** Pushes adsbygoogle on mount if the slot hasn't been initialised yet */
function useAdPush(ref: React.RefObject<HTMLModElement | null>) {
    const pathname = usePathname()
    useEffect(() => {
        try {
            if (ref.current && !ref.current.hasAttribute('data-adsbygoogle-status')) {
                ;(window as any).adsbygoogle = (window as any).adsbygoogle || []
                ;(window as any).adsbygoogle.push({})
            }
        } catch (err) {
            console.error('AdSense error:', err)
        }
    }, [pathname, ref])
}

/** Display Ad — auto-format, full-width responsive */
export function DisplayAd({ className }: AdProps) {
    const ref = useRef<HTMLModElement>(null)
    useAdPush(ref)

    return (
        <div className={`my-6 w-full min-h-[100px] overflow-hidden ${className || ''}`}>
            <ins
                ref={ref}
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-4573815949018090"
                data-ad-slot="8726422424"
                data-ad-format="auto"
                data-full-width-responsive="true"
            />
        </div>
    )
}

/** In-Article Ad — fluid format, centered */
export function InArticleAd({ className }: AdProps) {
    const ref = useRef<HTMLModElement>(null)
    useAdPush(ref)

    return (
        <div className={`my-8 w-full min-h-[100px] overflow-hidden ${className || ''}`}>
            <ins
                ref={ref}
                className="adsbygoogle"
                style={{ display: 'block', textAlign: 'center' }}
                data-ad-layout="in-article"
                data-ad-format="fluid"
                data-ad-client="ca-pub-4573815949018090"
                data-ad-slot="5629485791"
            />
        </div>
    )
}

/** In-Feed Ad — fluid format for between list items */
export function InFeedAd({ className }: AdProps) {
    const ref = useRef<HTMLModElement>(null)
    useAdPush(ref)

    return (
        <div className={`my-4 w-full min-h-[100px] overflow-hidden ${className || ''}`}>
            <ins
                ref={ref}
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-format="fluid"
                data-ad-layout-key="-gx+a+3n-h4+ib"
                data-ad-client="ca-pub-4573815949018090"
                data-ad-slot="4248586675"
            />
        </div>
    )
}

/** Multiplex Ad — grid of recommended content style ads */
export function MultiplexAd({ className }: AdProps) {
    const ref = useRef<HTMLModElement>(null)
    useAdPush(ref)

    return (
        <div className={`my-8 w-full min-h-[200px] overflow-hidden ${className || ''}`}>
            <ins
                ref={ref}
                className="adsbygoogle"
                style={{ display: 'inline-block', width: '100%', maxWidth: '600px', height: '200px' }}
                data-ad-client="ca-pub-4573815949018090"
                data-ad-slot="9028062330"
            />
        </div>
    )
}
