import Link from 'next/link'
import { ArrowRight, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HomeSectionHeaderProps {
    title: string
    subtitle?: string
    icon?: LucideIcon
    href?: string
    linkLabel?: string
    dark?: boolean
    className?: string
}

export function HomeSectionHeader({
    title,
    subtitle,
    icon: Icon,
    href,
    linkLabel = 'View All',
    dark = false,
    className,
}: HomeSectionHeaderProps) {
    return (
        <div className={cn('flex items-end justify-between gap-4 mb-7', className)}>
            <div className="flex items-start gap-3">
                {Icon && (
                    <div
                        className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                            dark ? 'bg-white/10 text-white' : 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                        )}
                    >
                        <Icon className="w-5 h-5" />
                    </div>
                )}
                <div>
                    <h2
                        className={cn(
                            'text-xl md:text-2xl font-display font-black tracking-tight',
                            dark ? 'text-white' : 'text-slate-900'
                        )}
                    >
                        {title}
                    </h2>
                    {subtitle && (
                        <p className={cn('text-sm mt-1', dark ? 'text-slate-400' : 'text-slate-500')}>{subtitle}</p>
                    )}
                </div>
            </div>
            {href && (
                <Link
                    href={href}
                    className={cn(
                        'text-sm font-bold flex items-center gap-1 transition-colors flex-shrink-0',
                        dark ? 'text-brand-300 hover:text-white' : 'text-brand-600 hover:text-brand-700'
                    )}
                >
                    {linkLabel} <ArrowRight className="w-4 h-4" />
                </Link>
            )}
        </div>
    )
}
