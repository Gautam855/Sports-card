import Link from 'next/link'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PaginationProps {
    currentPage: number
    totalPages: number
    totalCount?: number
    limit?: number
    baseUrl?: string
    searchParams?: Record<string, string | undefined>
    className?: string
    showSummary?: boolean
}

export function Pagination({
    currentPage,
    totalPages,
    totalCount,
    limit = 12,
    baseUrl = '/blog',
    searchParams = {},
    className,
    showSummary = true,
}: PaginationProps) {
    if (totalPages <= 1 && !totalCount) return null

    const createPageUrl = (page: number) => {
        const params = new URLSearchParams()
        
        // Preserve any existing search params except page
        Object.entries(searchParams).forEach(([key, val]) => {
            if (val && key !== 'page') {
                params.set(key, val)
            }
        })

        if (page > 1) {
            params.set('page', page.toString())
        }

        const queryString = params.toString()
        return `${baseUrl}${queryString ? `?${queryString}` : ''}`
    }

    // Generate page numbers with smart ellipsis
    const getPageNumbers = (): (number | 'ellipsis-prev' | 'ellipsis-next')[] => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1)
        }

        const pages: (number | 'ellipsis-prev' | 'ellipsis-next')[] = []

        if (currentPage <= 4) {
            for (let i = 1; i <= 5; i++) {
                pages.push(i)
            }
            pages.push('ellipsis-next')
            pages.push(totalPages)
        } else if (currentPage >= totalPages - 3) {
            pages.push(1)
            pages.push('ellipsis-prev')
            for (let i = totalPages - 4; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            pages.push(1)
            pages.push('ellipsis-prev')
            pages.push(currentPage - 1)
            pages.push(currentPage)
            pages.push(currentPage + 1)
            pages.push('ellipsis-next')
            pages.push(totalPages)
        }

        return pages
    }

    const pages = getPageNumbers()

    const startItem = (currentPage - 1) * limit + 1
    const endItem = totalCount ? Math.min(currentPage * limit, totalCount) : currentPage * limit

    return (
        <nav
            role="navigation"
            aria-label="Pagination"
            className={cn('flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-border/60', className)}
        >
            {/* Info Summary */}
            {showSummary && (
                <div className="text-xs text-muted-foreground font-medium">
                    {totalCount !== undefined ? (
                        <>
                            Showing <span className="font-bold text-foreground">{startItem}–{endItem}</span> of{' '}
                            <span className="font-bold text-foreground">{totalCount}</span> articles{' '}
                            <span className="hidden md:inline">(Page {currentPage} of {totalPages})</span>
                        </>
                    ) : (
                        <>
                            Page <span className="font-bold text-foreground">{currentPage}</span> of{' '}
                            <span className="font-bold text-foreground">{totalPages}</span>
                        </>
                    )}
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center gap-1.5 bg-card/80 backdrop-blur-md p-1.5 rounded-2xl border border-border shadow-sm">
                    {/* First page button */}
                    <Link
                        href={createPageUrl(1)}
                        aria-label="Go to first page"
                        aria-disabled={currentPage <= 1}
                        className={cn(
                            'p-2 rounded-xl text-xs font-semibold flex items-center justify-center transition-all',
                            currentPage <= 1
                                ? 'opacity-30 pointer-events-none text-muted-foreground'
                                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                        )}
                        tabIndex={currentPage <= 1 ? -1 : undefined}
                    >
                        <ChevronsLeft className="w-4 h-4" />
                    </Link>

                    {/* Previous page button */}
                    <Link
                        href={createPageUrl(Math.max(1, currentPage - 1))}
                        aria-label="Go to previous page"
                        aria-disabled={currentPage <= 1}
                        className={cn(
                            'px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all',
                            currentPage <= 1
                                ? 'opacity-30 pointer-events-none text-muted-foreground'
                                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                        )}
                        tabIndex={currentPage <= 1 ? -1 : undefined}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Prev</span>
                    </Link>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                        {pages.map((page, idx) => {
                            if (page === 'ellipsis-prev' || page === 'ellipsis-next') {
                                return (
                                    <span
                                        key={`ellipsis-${idx}`}
                                        className="w-8 h-8 flex items-center justify-center text-xs text-muted-foreground font-bold tracking-widest select-none"
                                    >
                                        •••
                                    </span>
                                )
                            }

                            const isCurrent = page === currentPage
                            return (
                                <Link
                                    key={page}
                                    href={createPageUrl(page)}
                                    aria-label={`Page ${page}`}
                                    aria-current={isCurrent ? 'page' : undefined}
                                    className={cn(
                                        'w-9 h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-all',
                                        isCurrent
                                            ? 'bg-primary text-white shadow-md shadow-primary/25 ring-2 ring-primary/40'
                                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    {page}
                                </Link>
                            )
                        })}
                    </div>

                    {/* Next page button */}
                    <Link
                        href={createPageUrl(Math.min(totalPages, currentPage + 1))}
                        aria-label="Go to next page"
                        aria-disabled={currentPage >= totalPages}
                        className={cn(
                            'px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all',
                            currentPage >= totalPages
                                ? 'opacity-30 pointer-events-none text-muted-foreground'
                                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                        )}
                        tabIndex={currentPage >= totalPages ? -1 : undefined}
                    >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="w-4 h-4" />
                    </Link>

                    {/* Last page button */}
                    <Link
                        href={createPageUrl(totalPages)}
                        aria-label="Go to last page"
                        aria-disabled={currentPage >= totalPages}
                        className={cn(
                            'p-2 rounded-xl text-xs font-semibold flex items-center justify-center transition-all',
                            currentPage >= totalPages
                                ? 'opacity-30 pointer-events-none text-muted-foreground'
                                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                        )}
                        tabIndex={currentPage >= totalPages ? -1 : undefined}
                    >
                        <ChevronsRight className="w-4 h-4" />
                    </Link>
                </div>
            )}
        </nav>
    )
}
