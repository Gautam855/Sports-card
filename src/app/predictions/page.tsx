import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PredictionCard } from '@/components/prediction/PredictionCard'
import { AdBanner } from '@/components/AdBanner'

export const metadata: Metadata = {
    title: 'Match Predictions — Expert Football & Cricket Predictions',
    description:
        'Expert match predictions with win probability, predicted playing 11, pitch report and team analysis. Today match prediction for football, cricket and more.',
    keywords: ['match prediction', 'today match prediction', 'cricket prediction', 'football prediction', 'dream11 prediction'],
}

export const revalidate = 300

export default async function PredictionsPage() {
    const supabase = await createClient()

    const { data: predictions } = await supabase
        .from('predictions')
        .select(`
      *,
      match:matches(
        *,
        sport:sports(*),
        league:leagues(*),
        home_team:teams!home_team_id(id,name,short_name,slug,logo_url),
        away_team:teams!away_team_id(id,name,short_name,slug,logo_url)
      ),
      author:profiles(username,display_name,avatar_url)
    `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(24)

    return (
        <div className="container-wide py-6 md:py-10">
            <div className="mb-8">
                <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Match Predictions</h1>
                <p className="text-muted-foreground">
                    Expert analysis, win probability and predicted line-ups for upcoming matches
                </p>
            </div>

            <AdBanner placement="article_top" className="mb-8" />

            {predictions && predictions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {predictions.map((prediction) => (
                        <PredictionCard key={prediction.id} prediction={prediction as any} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center py-24 text-center">
                    <p className="text-muted-foreground">No predictions available yet. Check back soon!</p>
                </div>
            )}
        </div>
    )
}