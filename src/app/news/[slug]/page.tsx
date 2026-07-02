import { getNewsBySlug, getRelatedNews } from '@/lib/api/news'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { formatDate } from '@/lib/utils'
import { NewsCard } from '@/components/news/NewsCard'
import { MerchandiseShowcase } from '@/components/merchandise/MerchandiseShowcase'
import { BlogContent } from '@/components/blog/BlogContent'

interface Props { params: Promise<{ slug: string }> }

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params
  const article = await getNewsBySlug(slug)

  if (!article) {
    // If it's a real-time news slug that no longer exists or is stale, redirect to news page
    redirect('/news')
  }


  const related = await getRelatedNews(article.id, article.category_id)

  return (
    <div className="container-wide py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
        <div className="flex items-center gap-4 text-muted-foreground mb-8">
           <span>{article.author?.display_name ?? article.author?.username}</span>
           <span>•</span>
           <span>{formatDate(article.published_at)}</span>
        </div>

        {article.cover_image && (
          <div className="relative aspect-video rounded-2xl overflow-hidden mb-10">
            <Image src={article.cover_image} alt={article.title} fill className="object-cover" />
          </div>
        )}

        <div className="mb-16">
          <BlogContent content={article.content || ''} />
        </div>

        <div className="border-t border-border pt-10 mb-16">
            <MerchandiseShowcase 
                placement="article_bottom" 
                layout="grid" 
                limit={4} 
                title="Trending Sports Gear"
                subtitle="Support your favorite teams and athletes"
            />
        </div>

        {related.length > 0 && (
          <div className="border-t border-border pt-10">
            <h2 className="text-2xl font-bold mb-6">Related News</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((item) => (
                <NewsCard key={item.id} article={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
