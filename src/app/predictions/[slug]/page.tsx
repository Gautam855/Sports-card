import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { CommentSection } from '@/components/community/CommentSection'
import { ShareButtons } from '@/components/ui/ShareButtons'
import { AdBanner } from '@/components/AdBanner'
import { PredictionCard } from '@/components/prediction/PredictionCard'
import { PredictedXI } from '@/components/prediction/PredictedXI'
import { WinProbabilityChart } from '@/components/prediction/WinProbabilityChart'
import { Eye, ThumbsUp, Calendar, CloudSun } from 'lucide-react'
import type { Prediction } from '@/lib/types'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const supabase = await createClient()
    const { data } = await supabase
        .from('predictions')
        .select('meta_title,meta_description,og_image,title,match:matches(title)')
        .eq('slug', slug)
        .single()
    if (!data) return {}
    return {
        title: data.meta_title ?? `Prediction: ${data.title}`,
        description: data.meta_description ?? `Expert match prediction and analysis for ${data.title}`,
        openGraph: { images: data.og_image ? [data.og_image] : [] },
    }
}

export default async function PredictionPage({ params }: Props) {
    const { slug } = await params
    const supabase = await createClient()

    const { data: prediction } = await supabase
        .from('predictions')
        .select(`
      *,
      match:matches(
        *,
        sport:sports(*), league:leagues(*),
        home_team:teams!home_team_id(*),
        away_team:teams!away_team_id(*),
        score:scores(*)
      ),
      author:profiles(id,username,display_name,avatar_url,bio)
    `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single()

    if (!prediction) notFound()

    // Fetch related predictions
    const { data: related } = await supabase
        .from('predictions')
        .select(`*, match:matches(*,sport:sports(*),league:leagues(*),home_team:teams!home_team_id(id,name,short_name,slug,logo_url),away_team:teams!away_team_id(id,name,short_name,slug,logo_url)), author:profiles(username,display_name)`)
        .eq('status', 'published')
        .neq('id', prediction.id)
        .order('published_at', { ascending: false })
        .limit(3)

    // Increment views
    supabase.rpc('increment_views', { p_table: 'predictions', p_id: prediction.id }).then(() => { })

    const p = prediction as unknown as Prediction
    const match = p.match!

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: p.title,
        author: p.author ? { '@type': 'Person', name: p.author.display_name ?? p.author.username } : undefined,
        datePublished: p.published_at,
        publisher: { '@type': 'Organization', name: 'SportsPulse' },
    }

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <div className="container-wide py-6 md:py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Main */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Header */}
                        <div>
                            <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                                <a href="/predictions" className="hover:text-foreground">Predictions</a>
                                <span>/</span>
                                <span>{match.sport?.name}</span>
                            </div>
                            <h1 className="font-display text-2xl md:text-3xl font-bold leading-tight mb-3">{p.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                {p.author && (
                                    <span className="flex items-center gap-2">
                                        {p.author.avatar_url && <Image src={p.author.avatar_url} alt={p.author.username} width={20} height={20} className="rounded-full" />}
                                        {p.author.display_name ?? p.author.username}
                                    </span>
                                )}
                                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{p.published_at ? new Date(p.published_at).toLocaleDateString() : ''}</span>
                                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{(p.views ?? 0).toLocaleString()} views</span>
                            </div>
                        </div>

                        {/* Match Overview Card */}
                        <div className="score-card p-6">
                            <div className="text-center mb-2">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {match.league?.name} · {match.scheduled_at ? new Date(match.scheduled_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : ''}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-4">
                                {/* Home Team */}
                                <div className="flex flex-col items-center gap-2 flex-1">
                                    {match.home_team?.logo_url && <Image src={match.home_team.logo_url} alt={match.home_team.name} width={64} height={64} className="object-contain" />}
                                    <span className="font-bold text-lg text-center">{match.home_team?.name}</span>
                                </div>
                                {/* Score / Time */}
                                <div className="flex flex-col items-center px-4">
                                    {match.status === 'completed' && match.score ? (
                                        <span className="font-display text-4xl font-black">{match.score.home_score} – {match.score.away_score}</span>
                                    ) : (
                                        <>
                                            <span className="font-display text-2xl font-black text-muted-foreground">VS</span>
                                            {p.predicted_score && (
                                                <span className="text-sm font-semibold text-primary mt-1">Pred: {p.predicted_score}</span>
                                            )}
                                        </>
                                    )}
                                    {match.venue && <span className="text-xs text-muted-foreground mt-2 text-center">{match.venue}</span>}
                                </div>
                                {/* Away Team */}
                                <div className="flex flex-col items-center gap-2 flex-1">
                                    {match.away_team?.logo_url && <Image src={match.away_team.logo_url} alt={match.away_team.name} width={64} height={64} className="object-contain" />}
                                    <span className="font-bold text-lg text-center">{match.away_team?.name}</span>
                                </div>
                            </div>
                        </div>

                        {/* Win Probability */}
                        {(p.home_win_prob || p.away_win_prob) && (
                            <div className="score-card p-6">
                                <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
                                    Win Probability
                                </h2>
                                <WinProbabilityChart
                                    home={{ name: match.home_team?.name ?? 'Home', prob: p.home_win_prob ?? 0 }}
                                    away={{ name: match.away_team?.name ?? 'Away', prob: p.away_win_prob ?? 0 }}
                                    draw={p.draw_prob}
                                />
                            </div>
                        )}

                        <AdBanner placement="article_top" />

                        {/* Analysis Content */}
                        {p.content && (
                            <div className="score-card p-6">
                                <h2 className="font-display font-bold text-xl mb-4">Match Analysis</h2>
                                <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: p.content }} />
                            </div>
                        )}

                        {/* Pitch & Weather */}
                        {(match.pitch_report || match.weather) && (
                            <div className="score-card p-6">
                                <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
                                    <CloudSun className="w-5 h-5 text-yellow-400" />
                                    Pitch & Weather
                                </h2>
                                {match.weather && (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                        {match.weather.temp_c !== undefined && (
                                            <Stat label="Temperature" value={`${match.weather.temp_c}°C`} />
                                        )}
                                        {match.weather.humidity !== undefined && (
                                            <Stat label="Humidity" value={`${match.weather.humidity}%`} />
                                        )}
                                        {match.weather.wind_kph !== undefined && (
                                            <Stat label="Wind" value={`${match.weather.wind_kph} km/h`} />
                                        )}
                                        {match.weather.condition && (
                                            <Stat label="Condition" value={match.weather.condition} />
                                        )}
                                    </div>
                                )}
                                {match.pitch_report && (
                                    <p className="text-muted-foreground text-sm leading-relaxed">{match.pitch_report}</p>
                                )}
                            </div>
                        )}

                        {/* Predicted XIs */}
                        {((p.predicted_xi_home?.length ?? 0) > 0 || (p.predicted_xi_away?.length ?? 0) > 0) && (
                            <div className="score-card p-6">
                                <h2 className="font-display font-bold text-xl mb-6">Predicted Playing XI</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {(p.predicted_xi_home?.length ?? 0) > 0 && (
                                        <PredictedXI
                                            team={match.home_team?.name ?? 'Home'}
                                            logo={match.home_team?.logo_url}
                                            players={p.predicted_xi_home!}
                                        />
                                    )}
                                    {(p.predicted_xi_away?.length ?? 0) > 0 && (
                                        <PredictedXI
                                            team={match.away_team?.name ?? 'Away'}
                                            logo={match.away_team?.logo_url}
                                            players={p.predicted_xi_away!}
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        <AdBanner placement="article_bottom" />

                        {/* Share */}
                        <div className="pt-4 border-t border-border">
                            <h3 className="font-semibold mb-3">Share this prediction</h3>
                            <ShareButtons
                                url={`${process.env.NEXT_PUBLIC_SITE_URL}/prediction/${p.slug}`}
                                title={p.title}
                            />
                        </div>

                        {/* Comments */}
                        <CommentSection contentId={p.id} contentType="prediction" />
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-6">
                        <AdBanner placement="sidebar" />
                        {related && related.length > 0 && (
                            <div>
                                <h3 className="font-display font-bold text-lg mb-4">More Predictions</h3>
                                <div className="space-y-4">
                                    {related.map(r => (
                                        <PredictionCard key={r.id} prediction={r as unknown as Prediction} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </>
    )
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="font-semibold text-sm">{value}</p>
        </div>
    )
}