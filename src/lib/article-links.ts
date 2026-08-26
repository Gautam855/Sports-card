type ArticleLike = {
    id?: string
    slug?: string
    href?: string
    url?: string
}

export function isExternalArticle(item: ArticleLike): boolean {
    return Boolean(item.id?.startsWith('serp-') && item.url)
}

export function getArticleHref(item: ArticleLike, type: 'news' | 'blog' = 'news'): string {
    if (item.href) return item.href
    if (isExternalArticle(item)) return item.url!
    if (item.slug) return type === 'blog' ? `/blog/${item.slug}` : `/news/${item.slug}`
    return '#'
}

export function getArticleLinkProps(item: ArticleLike, type: 'news' | 'blog' = 'news') {
    const external = isExternalArticle(item)
    return {
        href: getArticleHref(item, type),
        ...(external ? { target: '_blank' as const, rel: 'noopener noreferrer' } : {}),
    }
}
