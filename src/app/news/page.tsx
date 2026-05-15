import { getNews, getRealTimeNews } from '@/lib/api/news'
import { NewsCard } from '@/components/news/NewsCard'

export default async function NewsPage() {
  const [{ data: localArticles }, realTimeArticles] = await Promise.all([
    getNews(),
    getRealTimeNews("latest sports breaking news", 200)
  ])


  // Combine real-time news from Google News with our local database articles
  const allArticles = [...realTimeArticles, ...localArticles]

  return (
    <div className="container-wide py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Latest Sports News</h1>
        <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 rounded-full border border-red-500/20">
          <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Real-time Updates</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allArticles.length > 0 ? (
          allArticles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <p className="text-muted-foreground">No news articles found at the moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}

