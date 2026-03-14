import { factories } from '@strapi/strapi'

const UID = 'api::blog-reader-state.blog-reader-state' as any
const BLOG_UID = 'api::blog-post.blog-post' as any

type QueryMap = Record<string, string | undefined>

function normalizeCsv(value?: string): string[] {
  return String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function getDateFrom(time?: string): string | undefined {
  const now = new Date()

  if (time === 'week') {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }

  if (time === 'month') {
    const date = new Date(now)
    date.setMonth(date.getMonth() - 1)
    return date.toISOString()
  }

  return undefined
}

function sortPosts(posts: any[], sort: string, search: string) {
  posts.sort((left, right) => {
    const leftDate = new Date(left.publishedAt ?? left.createdAt ?? 0).getTime()
    const rightDate = new Date(right.publishedAt ?? right.createdAt ?? 0).getTime()

    if (sort === 'oldest') return leftDate - rightDate
    if (sort === 'most-viewed') return Number(right.views ?? 0) - Number(left.views ?? 0) || rightDate - leftDate
    if (sort === 'relevance' && search) {
      const leftTitle = String(left.title ?? '').toLowerCase()
      const rightTitle = String(right.title ?? '').toLowerCase()
      const leftScore = leftTitle.includes(search) ? 1 : 0
      const rightScore = rightTitle.includes(search) ? 1 : 0
      if (leftScore !== rightScore) return rightScore - leftScore
    }

    return rightDate - leftDate
  })
}

function sortStates(entries: any[], library: string, librarySort: string) {
  entries.sort((left, right) => {
    const leftPinned = Number(Boolean(left.isPinned))
    const rightPinned = Number(Boolean(right.isPinned))
    if (leftPinned !== rightPinned) return rightPinned - leftPinned

    if (library === 'favorite') {
      if (librarySort === 'most-viewed') {
        return Number(right.post?.views ?? 0) - Number(left.post?.views ?? 0)
      }
      const leftFavorite = new Date(left.favoritedAt ?? 0).getTime()
      const rightFavorite = new Date(right.favoritedAt ?? 0).getTime()
      return rightFavorite - leftFavorite
    }

    if (librarySort === 'most-viewed') {
      return Number(right.post?.views ?? 0) - Number(left.post?.views ?? 0)
    }

    const leftRead = new Date(left.lastReadAt ?? 0).getTime()
    const rightRead = new Date(right.lastReadAt ?? 0).getTime()
    return rightRead - leftRead
  })
}

function summarizeCounts(entries: any[]) {
  const now = Date.now()
  const dayAgo = now - 24 * 60 * 60 * 1000
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000

  const totalRead = entries.filter((entry) => entry.lastReadAt).length
  const totalFavorite = entries.filter((entry) => entry.isFavorite).length
  const totalPinned = entries.filter((entry) => entry.isPinned).length
  const recentReadToday = entries.filter((entry) => entry.lastReadAt && new Date(entry.lastReadAt).getTime() >= dayAgo).length
  const recentReadWeek = entries.filter((entry) => entry.lastReadAt && new Date(entry.lastReadAt).getTime() >= weekAgo).length
  const recentFavoriteToday = entries.filter((entry) => entry.favoritedAt && new Date(entry.favoritedAt).getTime() >= dayAgo).length
  const recentFavoriteWeek = entries.filter((entry) => entry.favoritedAt && new Date(entry.favoritedAt).getTime() >= weekAgo).length

  return {
    totalRead,
    totalFavorite,
    totalPinned,
    recentReadToday,
    recentReadWeek,
    recentFavoriteToday,
    recentFavoriteWeek,
  }
}

export default factories.createCoreController(UID, ({ strapi }: any) => ({
  async listMyStates(ctx: any) {
    const userId = ctx.state.user?.id
    if (!userId) return ctx.unauthorized('Yêu cầu đăng nhập')

    const query = ctx.query as QueryMap
    const documentIds = normalizeCsv(query.documentIds)

    const filters: Record<string, unknown> = {
      user: { id: userId },
    }

    if (documentIds.length > 0) {
      filters.post = { documentId: { $in: documentIds } }
    }

    const entries = await strapi.documents(UID).findMany({
      filters,
      fields: ['documentId', 'isFavorite', 'favoritedAt', 'isPinned', 'pinnedAt', 'firstReadAt', 'lastReadAt', 'readCount', 'updatedAt'],
      populate: {
        post: {
          fields: ['documentId', 'title', 'slug', 'excerpt', 'publishedAt', 'createdAt', 'views', 'featured'],
          populate: {
            thumbnail: { fields: ['url', 'formats', 'width', 'height', 'alternativeText'] },
            categories: { fields: ['name', 'slug'] },
            tags: { fields: ['name', 'slug'] },
          },
        },
      },
      sort: ['updatedAt:desc'],
      limit: documentIds.length > 0 ? documentIds.length : 500,
    })

    ctx.body = {
      data: entries,
      meta: {
        counts: summarizeCounts(entries as any[]),
      },
    }
  },

  async listMyPosts(ctx: any) {
    const userId = ctx.state.user?.id
    if (!userId) return ctx.unauthorized('Yêu cầu đăng nhập')

    const query = ctx.query as QueryMap
    const page = Math.max(1, Number(query.page ?? 1))
    const pageSize = Math.min(50, Math.max(1, Number(query.pageSize ?? 10)))
    const search = String(query.q ?? '').trim().toLowerCase()
    const categorySlug = query.cat ? String(query.cat) : null
    const tagSlugs = normalizeCsv(query.tags)
    const dateFrom = getDateFrom(query.time)
    const sort = String(query.sort ?? 'relevance')
    const library = String(query.library ?? 'all')
    const librarySort = String(query.librarySort ?? (library === 'favorite' ? 'recent-favorite' : 'recent-read'))

    const allStates = await strapi.documents(UID).findMany({
      filters: { user: { id: userId } },
      fields: ['documentId', 'isFavorite', 'favoritedAt', 'isPinned', 'pinnedAt', 'firstReadAt', 'lastReadAt', 'readCount', 'updatedAt'],
      populate: {
        post: {
          fields: [
            'documentId',
            'title',
            'slug',
            'content',
            'excerpt',
            'publishedAt',
            'createdAt',
            'views',
            'featured',
            'sourceName',
            'sourceTitle',
          ],
          populate: {
            thumbnail: { fields: ['url', 'formats', 'width', 'height', 'alternativeText'] },
            categories: { fields: ['name', 'slug'] },
            tags: { fields: ['name', 'slug'] },
          },
        },
      },
      limit: 1000,
    })

    const stateByPostId = new Map<string, any>(
      (allStates as any[])
        .filter((entry) => entry.post?.documentId)
        .map((entry) => [entry.post.documentId, entry])
    )

    let posts: any[] = []
    let statesForPage: any[] = []

    if (library === 'read' || library === 'favorite') {
      statesForPage = (allStates as any[]).filter((entry) => {
        if (!entry.post) return false
        if (library === 'favorite') return Boolean(entry.isFavorite)
        return Boolean(entry.lastReadAt)
      })

      statesForPage = statesForPage.filter((entry) => {
        const post = entry.post
        if (!post) return false

        if (search) {
          const haystack = [post.title, post.excerpt, post.content, post.sourceName, post.sourceTitle]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
          if (!haystack.includes(search)) return false
        }

        if (categorySlug) {
          const categories = Array.isArray(post.categories) ? post.categories : []
          if (!categories.some((category: any) => category.slug === categorySlug)) return false
        }

        if (tagSlugs.length > 0) {
          const tags = Array.isArray(post.tags) ? post.tags : []
          if (!tags.some((tag: any) => tagSlugs.includes(tag.slug))) return false
        }

        if (dateFrom) {
          const publishedAt = post.publishedAt ?? post.createdAt
          if (!publishedAt || new Date(publishedAt).toISOString() < dateFrom) return false
        }

        return true
      })

      sortStates(statesForPage, library, librarySort)
      posts = statesForPage.map((entry) => entry.post)
    } else {
      const blogPosts = await strapi.documents(BLOG_UID).findMany({
        status: 'published',
        fields: [
          'documentId',
          'title',
          'slug',
          'content',
          'excerpt',
          'publishedAt',
          'createdAt',
          'views',
          'featured',
          'sourceName',
          'sourceTitle',
        ],
        populate: {
          thumbnail: { fields: ['url', 'formats', 'width', 'height', 'alternativeText'] },
          categories: { fields: ['name', 'slug'] },
          tags: { fields: ['name', 'slug'] },
        },
        limit: 1000,
      })

      const readIds = new Set(
        (allStates as any[])
          .filter((entry) => entry.lastReadAt && entry.post?.documentId)
          .map((entry) => entry.post.documentId)
      )

      posts = (blogPosts as any[]).filter((post) => {
        if (!post?.documentId) return false
        if (library === 'unread' && readIds.has(post.documentId)) return false

        if (search) {
          const haystack = [post.title, post.excerpt, post.content, post.sourceName, post.sourceTitle]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
          if (!haystack.includes(search)) return false
        }

        if (categorySlug) {
          const categories = Array.isArray(post.categories) ? post.categories : []
          if (!categories.some((category: any) => category.slug === categorySlug)) return false
        }

        if (tagSlugs.length > 0) {
          const tags = Array.isArray(post.tags) ? post.tags : []
          if (!tags.some((tag: any) => tagSlugs.includes(tag.slug))) return false
        }

        if (dateFrom) {
          const publishedAt = post.publishedAt ?? post.createdAt
          if (!publishedAt || new Date(publishedAt).toISOString() < dateFrom) return false
        }

        return true
      })

      sortPosts(posts, sort, search)
    }

    const total = posts.length
    const start = (page - 1) * pageSize
    const pagedPosts = posts.slice(start, start + pageSize)

    ctx.body = {
      data: pagedPosts,
      meta: {
        pagination: {
          page,
          pageSize,
          pageCount: Math.ceil(total / pageSize),
          total,
        },
        counts: summarizeCounts(allStates as any[]),
        states: Object.fromEntries(
          pagedPosts
            .filter((post) => post.documentId)
            .map((post) => {
              const state = stateByPostId.get(post.documentId)
              return [
                post.documentId,
                state
                  ? {
                      documentId: state.documentId,
                      isFavorite: Boolean(state.isFavorite),
                      favoritedAt: state.favoritedAt ?? null,
                      isPinned: Boolean(state.isPinned),
                      pinnedAt: state.pinnedAt ?? null,
                      firstReadAt: state.firstReadAt ?? null,
                      lastReadAt: state.lastReadAt ?? null,
                      readCount: Number(state.readCount ?? 0),
                    }
                  : null,
              ]
            })
        ),
      },
    }
  },

  async summary(ctx: any) {
    const userId = ctx.state.user?.id
    if (!userId) return ctx.unauthorized('Yêu cầu đăng nhập')

    const entries = await strapi.documents(UID).findMany({
      filters: { user: { id: userId } },
      fields: ['isFavorite', 'favoritedAt', 'isPinned', 'pinnedAt', 'firstReadAt', 'lastReadAt', 'readCount'],
      limit: 1000,
    })

    ctx.body = {
      data: summarizeCounts(entries as any[]),
    }
  },

  async upsertMyState(ctx: any) {
    const userId = ctx.state.user?.id
    if (!userId) return ctx.unauthorized('Yêu cầu đăng nhập')

    const {
      blogPostDocumentId,
      markRead,
      isFavorite,
      isPinned,
    } = (ctx.request.body ?? {}) as Record<string, unknown>

    if (!blogPostDocumentId) {
      return ctx.badRequest('Thiếu blogPostDocumentId')
    }

    const existing = await strapi.documents(UID).findMany({
      filters: {
        user: { id: userId },
        post: { documentId: { $eq: String(blogPostDocumentId) } },
      },
      fields: ['documentId', 'isFavorite', 'favoritedAt', 'isPinned', 'pinnedAt', 'firstReadAt', 'lastReadAt', 'readCount'],
      limit: 1,
    })

    const found = existing[0]
    const now = new Date().toISOString()
    const data: Record<string, unknown> = {
      post: { connect: [{ documentId: String(blogPostDocumentId) }] },
    }

    if (markRead) {
      data.firstReadAt = found?.firstReadAt ?? now
      data.lastReadAt = now
      data.readCount = Number(found?.readCount ?? 0) + 1
    }

    if (typeof isFavorite === 'boolean') {
      data.isFavorite = isFavorite
      data.favoritedAt = isFavorite ? now : null
      if (!isFavorite) {
        data.isPinned = false
        data.pinnedAt = null
      }
    }

    if (typeof isPinned === 'boolean') {
      data.isPinned = isPinned
      data.pinnedAt = isPinned ? now : null
      if (isPinned) {
        data.isFavorite = true
        data.favoritedAt = found?.favoritedAt ?? now
      }
    }

    let result
    if (found?.documentId) {
      result = await strapi.documents(UID).update({
        documentId: found.documentId,
        data,
      })
    } else {
      result = await strapi.documents(UID).create({
        data: {
          user: userId,
          readCount: markRead ? 1 : 0,
          firstReadAt: markRead ? now : null,
          lastReadAt: markRead ? now : null,
          isFavorite: typeof isFavorite === 'boolean' ? isFavorite : Boolean(isPinned),
          favoritedAt: isFavorite === true || isPinned === true ? now : null,
          isPinned: isPinned === true,
          pinnedAt: isPinned === true ? now : null,
          ...data,
        },
      })
    }

    const populated = await strapi.documents(UID).findOne({
      documentId: result.documentId,
      fields: ['documentId', 'isFavorite', 'favoritedAt', 'isPinned', 'pinnedAt', 'firstReadAt', 'lastReadAt', 'readCount', 'updatedAt'],
      populate: {
        post: {
          fields: ['documentId', 'title', 'slug', 'excerpt', 'publishedAt', 'createdAt', 'views', 'featured'],
          populate: {
            thumbnail: { fields: ['url', 'formats', 'width', 'height', 'alternativeText'] },
            categories: { fields: ['name', 'slug'] },
            tags: { fields: ['name', 'slug'] },
          },
        },
      },
    })

    ctx.body = populated
  },
}))
