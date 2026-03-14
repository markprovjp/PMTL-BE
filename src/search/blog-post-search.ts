type RelatedItem = {
  name?: string | null
  slug?: string | null
}

type BlogPostSearchEntry = {
  id?: number
  documentId: string
  uuid?: string | null
  title?: string | null
  slug?: string | null
  content?: string | null
  excerpt?: string | null
  categories?: RelatedItem[] | null
  tags?: RelatedItem[] | null
  featured?: boolean | null
  views?: number | null
  likes?: number | null
  sourceName?: string | null
  sourceTitle?: string | null
  sourceUrl?: string | null
  thumbnail?: {
    url?: string | null
    alternativeText?: string | null
    formats?: Record<string, unknown> | null
    width?: number | null
    height?: number | null
  } | null
  seo?: {
    metaTitle?: string | null
    metaDescription?: string | null
    canonicalURL?: string | null
  } | null
  publishedAt?: string | null
  updatedAt?: string | null
  createdAt?: string | null
}

function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

export function stripHtml(value: string | null | undefined): string {
  if (!value) return ''
  return collapseWhitespace(value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' '))
}

export function normalizeSearchText(value: string | null | undefined): string {
  return stripHtml(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
}

function toSearchRelation(items: RelatedItem[] | null | undefined) {
  return (items ?? [])
    .filter((item): item is Required<Pick<RelatedItem, 'name' | 'slug'>> => Boolean(item?.name && item?.slug))
    .map((item) => ({
      name: item.name,
      slug: item.slug,
    }))
}

function buildExcerpt(entry: BlogPostSearchEntry): string {
  if (entry.excerpt?.trim()) return collapseWhitespace(entry.excerpt)
  const plainContent = stripHtml(entry.content)
  return plainContent.slice(0, 320)
}

function buildCanonicalPath(slug: string | null | undefined): string {
  return slug ? `/blog/${slug}` : '/blog'
}

function buildCanonicalUrl(entry: BlogPostSearchEntry): string | null {
  const seoCanonical = entry.seo?.canonicalURL?.trim()
  if (seoCanonical) return seoCanonical

  const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, '')
  if (!frontendUrl) return null

  return `${frontendUrl}${buildCanonicalPath(entry.slug)}`
}

export const BLOG_POST_MEILISEARCH_INDEX =
  process.env.MEILISEARCH_BLOG_POST_INDEX || 'blog-post'

export const BLOG_POST_MEILISEARCH_ENTRIES_QUERY = {
  status: 'published',
  limit: 500,
  fields: [
    'documentId',
    'uuid',
    'title',
    'slug',
    'content',
    'excerpt',
    'featured',
    'views',
    'likes',
    'sourceName',
    'sourceTitle',
    'sourceUrl',
    'publishedAt',
    'updatedAt',
    'createdAt',
  ],
  populate: {
    categories: {
      fields: ['name', 'slug'],
    },
    tags: {
      fields: ['name', 'slug'],
    },
    seo: {
      fields: ['metaTitle', 'metaDescription', 'canonicalURL'],
    },
    thumbnail: {
      fields: ['url', 'alternativeText', 'formats', 'width', 'height'],
    },
  },
}

export const BLOG_POST_MEILISEARCH_SETTINGS = {
  searchableAttributes: [
    'title',
    'normalizedTitle',
    'excerpt',
    'normalizedExcerpt',
    'content',
    'normalizedContent',
    'categories.name',
    'normalizedCategories',
    'tags.name',
    'normalizedTags',
    'sourceName',
    'sourceTitle',
  ],
  displayedAttributes: [
    'id',
    'documentId',
    'uuid',
    'title',
    'slug',
    'excerpt',
    'content',
    'thumbnail',
    'categories',
    'tags',
    'featured',
    'views',
    'likes',
    'sourceName',
    'sourceTitle',
    'sourceUrl',
    'publishedAt',
    'updatedAt',
    'createdAt',
    'canonicalPath',
    'canonicalUrl',
    'contentType',
    'isPublished',
    'locale',
  ],
  filterableAttributes: [
    'categories.slug',
    'tags.slug',
    'featured',
    'publishedAt',
    'updatedAt',
    'contentType',
    'isPublished',
    'locale',
  ],
  sortableAttributes: ['publishedAt', 'updatedAt', 'createdAt', 'views', 'likes'],
  rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
  typoTolerance: {
    enabled: true,
  },
}

export function transformBlogPostSearchEntry({ entry }: { entry: BlogPostSearchEntry }) {
  const title = collapseWhitespace(entry.title ?? '')
  const content = stripHtml(entry.content)
  const excerpt = buildExcerpt(entry)
  const categories = toSearchRelation(entry.categories)
  const tags = toSearchRelation(entry.tags)

  return {
    ...entry,
    title,
    excerpt,
    content,
    categories,
    tags,
    normalizedTitle: normalizeSearchText(title),
    normalizedExcerpt: normalizeSearchText(excerpt),
    normalizedContent: normalizeSearchText(content),
    normalizedCategories: categories.map((item) => normalizeSearchText(item.name)),
    normalizedTags: tags.map((item) => normalizeSearchText(item.name)),
    canonicalPath: buildCanonicalPath(entry.slug),
    canonicalUrl: buildCanonicalUrl(entry),
    contentType: 'blog-post',
    isPublished: Boolean(entry.publishedAt),
    locale: 'vi',
  }
}
