import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Users, ExternalLink, Sparkles } from 'lucide-react'

interface TeamPlayersSectionProps {
    categoryId?: string
    categoryName?: string
    categorySlug?: string
    title?: string
    className?: string
}

export async function TeamPlayersSection({
    categoryId,
    categoryName,
    categorySlug,
    title,
    className = 'mt-14 mb-8',
}: TeamPlayersSectionProps) {
    const supabase = await createClient()

    let targetCatId = categoryId
    let resolvedName = categoryName

    // If categoryId is not provided, look up by categorySlug
    if (!targetCatId && categorySlug) {
        const { data: cat } = await supabase
            .from('news_categories')
            .select('id, name')
            .or(`slug.eq.${categorySlug},slug.ilike.${categorySlug}`)
            .maybeSingle()

        if (cat) {
            targetCatId = cat.id
            if (!resolvedName) resolvedName = cat.name
        }
    }

    if (!targetCatId) return null

    const { data: players } = await supabase
        .from('category_players')
        .select('id, player_name, player_image, player_url, sort_order')
        .eq('category_id', targetCatId)
        .order('sort_order', { ascending: true })

    if (!players || players.length === 0) return null

    const displayTitle = title || (resolvedName ? `${resolvedName} Stars & Players` : 'Featured Players')

    return (
        <section className={className}>
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-b from-slate-50/80 via-white to-white shadow-sm p-6 sm:p-8">
                {/* Decorative background accent */}
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />

                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shadow-sm">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 font-display">
                                    {displayTitle}
                                </h3>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100/80 text-red-700">
                                    <Sparkles className="w-2.5 h-2.5" />
                                    {players.length}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">Explore player pages, stats &amp; exclusive profiles</p>
                        </div>
                    </div>
                    {categorySlug && (
                        <Link
                            href={`/sports/${categorySlug}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 uppercase tracking-wider transition-colors self-start sm:self-auto"
                        >
                            All {resolvedName || 'Sport'} News &rarr;
                        </Link>
                    )}
                </div>

                {/* Players Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                    {players.map((player) => {
                        const cardContent = (
                            <div className="group relative flex flex-col items-center text-center p-3.5 rounded-xl border border-slate-200/60 bg-white hover:border-red-300 hover:shadow-lg hover:shadow-red-500/5 transition-all duration-300 h-full">
                                {/* Photo Container */}
                                <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-full p-1 bg-gradient-to-tr from-slate-200 to-slate-100 group-hover:from-red-500 group-hover:to-amber-400 transition-all duration-300 shadow-sm mb-3">
                                    <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 relative">
                                        {player.player_image ? (
                                            <img
                                                src={player.player_image}
                                                alt={player.player_name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                                                <Users className="w-7 h-7" />
                                            </div>
                                        )}
                                    </div>
                                    {player.player_url && (
                                        <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 transition-colors">
                                            <ExternalLink className="w-3 h-3" />
                                        </div>
                                    )}
                                </div>

                                {/* Name */}
                                <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-red-600 transition-colors line-clamp-2 leading-tight">
                                    {player.player_name}
                                </span>

                                <span className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wider group-hover:text-slate-600 transition-colors">
                                    View Profile
                                </span>
                            </div>
                        )

                        if (player.player_url) {
                            return (
                                <Link key={player.id} href={player.player_url} className="block">
                                    {cardContent}
                                </Link>
                            )
                        }

                        return <div key={player.id}>{cardContent}</div>
                    })}
                </div>
            </div>
        </section>
    )
}
