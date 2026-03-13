/**
 * blog-post controller
 */

import { factories } from '@strapi/strapi'
import { createHash } from 'node:crypto'
import { atomicIncrementField, findPublished } from '../../../utils/strapi-helpers'
import { createLogger } from '../../../utils/logger'
import { RATE_LIMITS } from '../../../utils/rate-limit'

const BLOG_UID = 'api::blog-post.blog-post'

// In-memory view dedup: key = `${ipHash}:${documentId}`, ttl = 1h
const viewCooldown = new Map<string, number>()
const VIEW_COOLDOWN_MS = RATE_LIMITS.blogViewCooldownMs

function hashIpView(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').slice(0, 16)
}

function shouldCountView(key: string): boolean {
  const last = viewCooldown.get(key)
  if (!last) return true
  return Date.now() - last >= VIEW_COOLDOWN_MS
}

function recordView(key: string): void {
  viewCooldown.set(key, Date.now())
  if (viewCooldown.size > 50_000) {
    const cutoff = Date.now() - VIEW_COOLDOWN_MS
    for (const [k, v] of viewCooldown.entries()) {
      if (v < cutoff) viewCooldown.delete(k)
    }
  }
}

export default factories.createCoreController(BLOG_UID, ({ strapi }) => ({
  /**
   * POST /api/blog-posts/:documentId/view
   * Atomically increments the view counter using a single raw SQL UPDATE.
   */
  async incrementView(ctx) {
    const { documentId } = ctx.params
    const log = createLogger(strapi, 'blog-post')

    try {
      const exists = await findPublished(strapi, BLOG_UID, documentId)
      if (!exists) return ctx.notFound('Post not found')

      // IP dedup: mỗi IP chỉ tính 1 lượt xem / bài / giờ
      const rawIp: string =
        (ctx.request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
        ctx.request.ip ??
        'unknown'
      const cooldownKey = `${hashIpView(rawIp)}:${documentId}`
      if (!shouldCountView(cooldownKey)) {
        ctx.status = 200
        ctx.body = { ok: true, skipped: true }
        return
      }
      recordView(cooldownKey)

      const newViews = await atomicIncrementField(strapi, BLOG_UID, documentId, 'views')

      void strapi
        .service('api::blog-post.search-index')
        .reindexBlogPost(documentId)
        .catch((error) => {
          log.warn('incrementView reindex failed', error)
        })

      ctx.status = 200
      ctx.body = { ok: true, newViews }
    } catch (err) {
      log.error('incrementView failed', err)
      ctx.status = 500
      ctx.body = { ok: false, error: 'Internal server error' }
    }
  },

  /**
   * GET /api/blog-posts/archive?year=YYYY&month=MM&page=1&pageSize=10
   * Lấy bài viết đã xuất bản theo năm/tháng.
   */
  async archive(ctx) {
    const log = createLogger(strapi, 'blog-post')
    const year = parseInt(String(ctx.query['year'] ?? ''), 10)
    const month = parseInt(String(ctx.query['month'] ?? ''), 10)
    const page = Math.max(1, parseInt(String(ctx.query['page'] ?? '1'), 10))
    const pageSize = Math.min(50, Math.max(1, parseInt(String(ctx.query['pageSize'] ?? '12'), 10)))

    if (isNaN(year) || year < 2000 || year > 2100) {
      return ctx.badRequest('Năm không hợp lệ.')
    }

    try {
      let dateFrom: string
      let dateTo: string

      if (!isNaN(month) && month >= 1 && month <= 12) {
        dateFrom = new Date(year, month - 1, 1).toISOString()
        dateTo = new Date(year, month, 1).toISOString()
      } else {
        dateFrom = new Date(year, 0, 1).toISOString()
        dateTo = new Date(year + 1, 0, 1).toISOString()
      }

      const posts = await (strapi.documents as any)(BLOG_UID).findMany({
        filters: {
          publishedAt: { $gte: dateFrom, $lt: dateTo },
        },
        status: 'published',
        sort: ['publishedAt:desc'],
        start: (page - 1) * pageSize,
        limit: pageSize,
        fields: ['documentId', 'title', 'slug', 'excerpt', 'publishedAt', 'views'],
        populate: {
          thumbnail: { fields: ['url', 'formats', 'width', 'height', 'alternativeText'] },
          categories: { fields: ['name', 'slug'] },
        },
      })

      const total = await (strapi.db as any).query(BLOG_UID).count({
        where: {
          published_at: { $gte: dateFrom, $lt: dateTo, $notNull: true },
        },
      })

      ctx.body = {
        data: posts,
        meta: {
          pagination: {
            page,
            pageSize,
            pageCount: Math.ceil((total || 0) / pageSize),
            total: total || 0,
          },
          archive: { year, month: isNaN(month) ? null : month },
        },
      }
    } catch (err) {
      log.error('archive failed', err)
      ctx.status = 500
      ctx.body = { error: 'Lỗi server.' }
    }
  },

  /**
   * GET /api/blog-posts/archive-index
   * Trả về thống kê bài viết theo năm/tháng (dùng cho trang mục lục lưu trữ).
   */
  async archiveIndex(ctx) {
    const log = createLogger(strapi, 'blog-post')

    try {
      // Lấy tối đa 2000 bài (chỉ lấy publishedAt)
      const posts = await (strapi.documents as any)(BLOG_UID).findMany({
        status: 'published',
        sort: ['publishedAt:desc'],
        limit: 2000,
        fields: ['publishedAt'],
      })

      // Tổng hợp theo năm/tháng
      const countMap = new Map<string, number>()
      for (const post of (posts as any[])) {
        if (!post.publishedAt) continue
        const d = new Date(post.publishedAt)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        countMap.set(key, (countMap.get(key) ?? 0) + 1)
      }

      // Nhóm theo năm
      const yearMap = new Map<number, { month: number; count: number }[]>()
      for (const [key, count] of countMap.entries()) {
        const [y, m] = key.split('-').map(Number)
        if (!yearMap.has(y)) yearMap.set(y, [])
        yearMap.get(y)!.push({ month: m, count })
      }

      const result = Array.from(yearMap.entries())
        .sort(([a], [b]) => b - a)
        .map(([year, months]) => ({
          year,
          total: months.reduce((s, x) => s + x.count, 0),
          months: months.sort((a, b) => b.month - a.month),
        }))

      ctx.body = { data: result }
    } catch (err) {
      log.error('archiveIndex failed', err)
      ctx.status = 500
      ctx.body = { error: 'Lỗi server.' }
    }
  },

  /**
   * GET /api/blog-posts/series/:seriesKey?currentSlug=
   * Lấy tất cả bài trong cùng chuyên đề, sắp xếp theo seriesNumber.
   */
  async series(ctx) {
    const { seriesKey } = ctx.params as { seriesKey: string }
    const currentSlug = String(ctx.query['currentSlug'] ?? '')
    const log = createLogger(strapi, 'blog-post')

    if (!seriesKey) return ctx.badRequest('Thiếu seriesKey.')

    try {
      const posts = await (strapi.documents as any)(BLOG_UID).findMany({
        filters: { seriesKey: { $eq: seriesKey } },
        status: 'published',
        sort: ['seriesNumber:asc', 'publishedAt:asc'],
        limit: 200,
        fields: [
          'documentId', 'title', 'slug', 'seriesKey', 'seriesNumber',
          'eventDate', 'location', 'publishedAt',
        ],
        populate: {
          thumbnail: { fields: ['url', 'formats', 'alternativeText'] },
        },
      })

      const currentIndex = currentSlug
        ? (posts as any[]).findIndex((p: any) => p.slug === currentSlug)
        : -1

      ctx.body = {
        data: posts,
        meta: {
          seriesKey,
          currentSlug,
          currentIndex,
          prev: currentIndex > 0 ? (posts as any[])[currentIndex - 1] : null,
          next: currentIndex >= 0 && currentIndex < (posts as any[]).length - 1
            ? (posts as any[])[currentIndex + 1]
            : null,
        },
      }
    } catch (err) {
      log.error('series failed', err)
      ctx.status = 500
      ctx.body = { error: 'Lỗi server.' }
    }
  },
}))
