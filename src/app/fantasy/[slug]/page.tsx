import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { CommentSection } from '@/components/community/CommentSection'
import { ShareButtons } from '@/components/ui/ShareButtons'
import { AdBanner } from '@/components/AdBanner'
import { Star, TrendingUp, TrendingDown, Users, Eye } from 'lucide-react'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const supabase = await createClient()
    const { data } = await supabase.from('fantasy_tips').select('title,meta_title,meta_description').eq('slug', slug).single()
    if (!data) return {}
    return {
        title: data.meta_title ?? `Fantasy Tips: ${data.title}`,
        description: data.meta_description ?? `Dream11 team tips and captain picks for ${data.title}`,
    }
}

export default async function FantasyTipPage({ params }: Props) {
    const { slug } = await params
    const supabase = await createClient()

    const { data: tip } = await supabase
        .from('fantasy_tips')
        .select(`
      *,
      match:matches(*,sport:sports(*),league:leagues(*),
        home_team:teams!home_team_id(*),away_team:teams!away_team_id(*)),
      author:profiles(id,username,display_name,avatar_url),
      captain_player:players!captain(id,name,photo_url,position,stats),
      vc_player:players!vice_captain(id,name,photo_url,position,stats)
    `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single()

    if (!tip) notFound()

    // Fetch top pick player details
    const topPickIds = tip.top_picks ?? []
    const differentialIds = tip.differentials ?? []
    const avoidIds = tip.avoid_players ?? []
    const allIds = [...new Set([...topPickIds, ...differentialIds, ...avoidIds])]

    const { data: players } = allIds.length > 0
        ? await supabase.from('players').select('id,name,photo_url,position,stats').in('id', allIds)
        : { data: [] }

    const playerMap = new Map((players ?? []).map(p => [p.id, p]))

    supabase.rpc('increment_views', { p_table: 'fantasy_tips', p_id: tip.id }).then(() => { })

    const match = tip.match

    return (
        <div className="container-wide py-6 md:py-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <a href="/fantasy" className="hover:text-foreground">Fantasy</a>
                        <span>/</span>
                        <span>{match?.sport?.name}</span>
                    </div>

                    {/* Title */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-bold px-2 py-1 rounded">
                                {tip.platform ?? 'FANTASY TIPS'}
                            </span>
                            {tip.match?.league?.name && (
                                <span className="text-xs text-muted-foreground">{tip.match.league.name}</span>
                            )}
                        </div>
                        <h1 className="font-display text-2xl md:text-3xl font-bold leading-tight mb-3">{tip.title}</h1>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {tip.author && <span>{tip.author.display_name ?? tip.author.username}</span>}
                            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{tip.views.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Match Card */}
                    {match && (
                        <div className="score-card p-5">
                            <div className="flex items-center justify-between">
                                <TeamInfo team={match.home_team} />
                                <div className="text-center px-4">
                                    <span className="text-xs text-muted-foreground block mb-1">{match.league?.name}</span>
                                    <span className="font-bold text-lg">VS</span>
                                    <span className="text-xs text-muted-foreground block mt-1">
                                        {match.scheduled_at ? new Date(match.scheduled_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : ''}
                                    </span>
                                    {match.venue && <span className="text-xs text-muted-foreground">{match.venue}</span>}
                                </div>
                                <TeamInfo team={match.away_team} />
                            </div>
                        </div>
                    )}

                    <AdBanner placement="article_top" />

                    {/* Captain & VC */}
                    <div className="score-card p-6">
                        <h2 className="font-display font-bold text-xl mb-4">Captain & Vice-Captain Picks</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {tip.captain_player && (
                                <PickCard player={tip.captain_player as any} badge="C" color="yellow" label="Captain Pick" />
                            )}
                            {tip.vc_player && (
                                <PickCard player={tip.vc_player as any} badge="VC" color="blue" label="Vice-Captain" />
                            )}
                        </div>
                    </div>

                    {/* Top Picks */}
                    {topPickIds.length > 0 && (
                        <PlayerPickSection
                            title="Top Picks"
                            icon={<Star className="w-5 h-5 text-yellow-400" />}
                            players={topPickIds.map((id: string) => playerMap.get(id)).filter(Boolean) as any[]}
                        />
                    )}

                    {/* Differentials */}
                    {differentialIds.length > 0 && (
                        <PlayerPickSection
                            title="Differential Picks"
                            icon={<TrendingUp className="w-5 h-5 text-green-400" />}
                            description="Low-ownership players who can give you the edge"
                            players={differentialIds.map((id: string) => playerMap.get(id)).filter(Boolean) as any[]}
                        />
                    )}

                    {/* Players to Avoid */}
                    {avoidIds.length > 0 && (
                        <PlayerPickSection
                            title="Players to Avoid"
                            icon={<TrendingDown className="w-5 h-5 text-red-400" />}
                            description="Skip these players in your fantasy team"
                            players={avoidIds.map((id: string) => playerMap.get(id)).filter(Boolean) as any[]}
                            avoid
                        />
                    )}

                    {/* Analysis content */}
                    {tip.content && (
                        <div className="score-card p-6">
                            <h2 className="font-display font-bold text-xl mb-4">Detailed Analysis</h2>
                            <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: tip.content }} />
                        </div>
                    )}

                    <AdBanner placement="article_bottom" />

                    <div className="pt-4 border-t border-border">
                        <ShareButtons url={`${process.env.NEXT_PUBLIC_SITE_URL}/fantasy/${tip.slug}`} title={tip.title} />
                    </div>

                    <CommentSection contentId={tip.id} contentType="fantasy" />
                </div>

                {/* Sidebar */}
                <aside className="space-y-6">
                    <AdBanner placement="sidebar" />
                </aside>
            </div>
        </div>
    )
}

function TeamInfo({ team }: { team?: { name: string; logo_url?: string } }) {
    return (
        <div className="flex flex-col items-center gap-2 flex-1">
            {team?.logo_url ? (
                <Image src={team.logo_url} alt={team.name} width={48} height={48} className="object-contain" />
            ) : (
                <div className="w-12 h-12 rounded-full bg-muted" />
            )}
            <span className="font-semibold text-sm text-center">{team?.name ?? 'TBD'}</span>
        </div>
    )
}

function PickCard({ player, badge, color, label }: {
    player: { name: string; photo_url?: string; position?: string }
    badge: string; color: 'yellow' | 'blue'; label: string
}) {
    const colors = {
        yellow: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
        blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    }
    return (
        <div className={`border rounded-xl p-4 text-center ${colors[color]}`}>
            <div className="text-xs font-bold uppercase tracking-wider mb-3 opacity-70">{label}</div>
            {player.photo_url ? (
                <Image src={player.photo_url} alt={player.name} width={64} height={64} className="rounded-full mx-auto mb-2 object-cover" />
            ) : (
                <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-2 flex items-center justify-center font-bold text-xl">
                    {player.name[0]}
                </div>
            )}
            <div className={`inline-block px-2 py-0.5 rounded font-bold text-xs mb-1 ${color === 'yellow' ? 'bg-yellow-500 text-black' : 'bg-blue-500 text-white'}`}>
                {badge}
            </div>
            <div className="font-semibold">{player.name}</div>
            {player.position && <div className="text-xs opacity-70 mt-0.5">{player.position}</div>}
        </div>
    )
}

function PlayerPickSection({ title, icon, description, players, avoid }: {
    title: string; icon: React.ReactNode; description?: string
    players: Array<{ id: string; name: string; photo_url?: string; position?: string }>
    avoid?: boolean
}) {
    return (
        <div className="score-card p-6">
            <div className="flex items-center gap-2 mb-1">
                {icon}
                <h2 className="font-display font-bold text-xl">{title}</h2>
            </div>
            {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                {players.map((p) => (
                    <div key={p.id} className={`flex items-center gap-2.5 p-2.5 rounded-lg ${avoid ? 'bg-red-500/5 border border-red-500/10' : 'bg-muted/50'}`}>
                        {p.photo_url ? (
                            <Image src={p.photo_url} alt={p.name} width={32} height={32} className="rounded-full object-cover flex-shrink-0" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0 flex items-center justify-center text-xs font-bold">{p.name[0]}</div>
                        )}
                        <div className="min-w-0">
                            <div className="text-xs font-semibold truncate">{p.name}</div>
                            {p.position && <div className="text-[10px] text-muted-foreground">{p.position}</div>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}