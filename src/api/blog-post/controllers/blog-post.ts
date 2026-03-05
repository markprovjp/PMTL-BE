/**
 * blog-post controller
 */

import { factories } from '@strapi/strapi'
import { atomicIncrementField, findPublished } from '../../../utils/strapi-helpers'
import { createLogger } from '../../../utils/logger'

const BLOG_UID = 'api::blog-post.blog-post'

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

      const newViews = await atomicIncrementField(strapi, BLOG_UID, documentId, 'views')

      ctx.status = 200
      ctx.body = { ok: true, newViews }
    } catch (err) {
      log.error('incrementView failed', err)
      ctx.status = 500
      ctx.body = { ok: false, error: 'Internal server error' }
    }
  },
}))
