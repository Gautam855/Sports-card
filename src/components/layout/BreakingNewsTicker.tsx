import { getBreakingNews } from '@/lib/api/news'
import Link from 'next/link'

export async function BreakingNewsTicker() {
    let news: { id: string; title: string; slug: string }[] = []

    try {
        news = await getBreakingNews(8)
    } catch {
        return null
    }

    if (!news.length) return null

    const items = [...news, ...news] // duplicate for seamless loop

    return (
        <div className="bg-red-600 text-white overflow-hidden h-9 flex items-center z-50">
            <div className="flex-shrink-0 bg-red-700 px-4 h-full flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                Breaking
            </div>
            <div className="relative flex-1 overflow-hidden">
                <div
                    className="flex gap-8 whitespace-nowrap animate-ticker"
                    style={{ animationDuration: `${Math.max(news.length * 4, 30)}s` }}
                >
                    {items.map((item, i) => (
                        <Link
                            key={`${item.id}-${i}`}
                            href={`/news/${item.slug}`}
                            className="text-xs hover:underline flex-shrink-0"
                        >
                            {item.title}
                            <span className="ml-8 text-red-300">•</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}