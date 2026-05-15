import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { FantasyCard } from '@/components/fantasy/FantasyCard'
import { AdBanner } from '@/components/AdBanner'

export const metadata: Metadata = {
    title: 'Fantasy Tips — Dream11 Team Prediction & Captain Picks',
    description:
        'Expert Dream11 team suggestions, captain and vice-captain picks, top player recommendations and differential picks for today\'s matches.',
    keywords: [
        'dream11 prediction', 'dream11 team today', 'fantasy cricket tips',
        'fantasy football tips', 'captain pick today', 'dream11 playing 11'
    ],
}

export const revalidate = 300

export default async function FantasyPage() {
    const supabase = await createClient()

    const { data: tips } = await supabase
        .from('fantasy_tips')
        .select(`
      *,
      match:matches(
        *,
        sport:sports(*), league:leagues(*),
        home_team:teams!home_team_id(id,name,short_name,slug,logo_url),
        away_team:teams!away_team_id(id,name,short_name,slug,logo_url)
      ),
      author:profiles(username,display_name,avatar_url),
      captain_player:players!captain(id,name,photo_url,position),
      vc_player:players!vice_captain(id,name,photo_url,position)
    `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(24)

    return (
        <div className="container-wide py-6 md:py-10">
            <div className="mb-8">
                <div className="inline-flex items-center gap-2 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full px-3 py-1 text-xs font-semibold mb-3">
                    🏆 Fantasy Sports
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                    Fantasy Tips & Dream11 Predictions
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                    Expert captain picks, top fantasy players, differential options and complete team
                    suggestions for today's matches across cricket, football and more.
                </p>
            </div>

            <AdBanner placement="article_top" className="mb-8" />

            {tips && tips.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {tips.map((tip) => (
                        <FantasyCard key={tip.id} tip={tip as any} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center py-24 text-center">
                    <div className="text-4xl mb-3">🏏</div>
                    <h3 className="font-semibold text-lg mb-1">No fantasy tips yet</h3>
                    <p className="text-muted-foreground text-sm">Check back before match day for expert picks.</p>
                </div>
            )}
        </div>
    )
}