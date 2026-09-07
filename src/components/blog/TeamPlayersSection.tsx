import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Users } from 'lucide-react'

interface TeamPlayersSectionProps {
    categoryId: string
    categoryName?: string
    categorySlug?: string
}

export async function TeamPlayersSection({ categoryId, categoryName, categorySlug }: TeamPlayersSectionProps) {
    const supabase = await createClient()

    const { data: players } = await supabase
        .from('category_players')
        .select('id, player_name, player_image, player_url, sort_order')
        .eq('category_id', categoryId)
        .order('sort_order', { ascending: true })

    if (!players || players.length === 0) return null

    return (
        <section className="mt-12 mb-8">
            <div className="rounded-2xl border border-border bg-gradient-to-b from-muted/30 to-background overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Users className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-foreground">
                                {categoryName ? `${categoryName} Players` : 'Team Players'}
                            </h3>
                            <p className="text-[10px] text-muted-foreground">Popular players in this sport</p>
                        </div>
                    </div>
                    {categorySlug && (
                        <Link
                            href={`/sports/${categorySlug}`}
                            className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider"
                        >
                            View All →
                        </Link>
                    )}
                </div>

                {/* Players Grid */}
                <div className="p-5">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                        {players.map((player) => {
                            const content = (
                                <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                    {/* Photo */}
                                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-border group-hover:border-primary/50 transition-colors shadow-sm group-hover:shadow-md">
                                        {player.player_image ? (
                                            <Image
                                                src={player.player_image}
                                                alt={player.player_name}
                                                fill
                                                className="object-cover"
                                                sizes="80px"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-muted flex items-center justify-center">
                                                <Users className="w-6 h-6 text-muted-foreground/40" />
                                            </div>
                                        )}
                                    </div>
                                    {/* Name */}
                                    <span className="text-[11px] sm:text-xs font-semibold text-center text-muted-foreground group-hover:text-foreground transition-colors leading-tight line-clamp-2">
                                        {player.player_name}
                                    </span>
                                </div>
                            )

                            if (player.player_url) {
                                return (
                                    <Link key={player.id} href={player.player_url}>
                                        {content}
                                    </Link>
                                )
                            }

                            return <div key={player.id}>{content}</div>
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}
