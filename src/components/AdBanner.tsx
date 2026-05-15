import { cn } from '@/lib/utils'

interface AdBannerProps {
    placement: string
    className?: string
}

export function AdBanner({ placement, className }: AdBannerProps) {
    // In production, fetch ad from database or use Google AdSense
    // This is a placeholder that shows AdSense slot
    if (process.env.NODE_ENV === 'development') {
        return (
            <div className={cn('w-full bg-muted/30 border border-dashed border-muted-foreground/20 rounded-xl flex items-center justify-center text-xs text-muted-foreground p-4', className)}>
                Ad Placement: {placement}
            </div>
        )
    }

    return (
        <div className={cn('w-full overflow-hidden', className)}>
            {/* Google AdSense or custom ad */}
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT}
                data-ad-slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT}
                data-ad-format="auto"
                data-full-width-responsive="true"
            />
        </div>
    )
}