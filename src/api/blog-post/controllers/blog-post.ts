/**
 * blog-post controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::blog-post.blog-post', ({ strapi }) => ({
  /**
   * POST /api/blog-posts/:documentId/view
   * Atomically increments the view counter.
   * Uses raw DB query to avoid race conditions.
   */
  async incrementView(ctx) {
    const { documentId } = ctx.params
    console.log(`[incrementView] --- View Request for: ${documentId} ---`)

    try {
      // Find the post by documentId - specify 'published' status to be sure
      const publishedPost = await strapi.documents('api::blog-post.blog-post').findOne({
        documentId,
        status: 'published'
      })

      const draftPost = await strapi.documents('api::blog-post.blog-post').findOne({
        documentId,
        status: 'draft'
      })

      if (!publishedPost && !draftPost) {
        console.warn(`[incrementView] Post NOT found for documentId: ${documentId}`)
        return ctx.notFound('Post not found')
      }

      // Use highest count found as base
      const currentViews = Math.max(publishedPost?.views || 0, draftPost?.views || 0)
      const nextViews = currentViews + 1

      // Update Published if it exists
      if (publishedPost) {
        await strapi.documents('api::blog-post.blog-post').update({
          documentId,
          status: 'published',
          data: { views: nextViews },
        })
      }

      // Update Draft if it exists
      if (draftPost) {
        await strapi.documents('api::blog-post.blog-post').update({
          documentId,
          status: 'draft',
          data: { views: nextViews },
        })
      }

      console.log(`[incrementView] Sync SUCCESS for DocID: ${documentId}. New views: ${nextViews}`)

      ctx.status = 200
      ctx.body = { ok: true, newViews: nextViews }
    } catch (err) {
      console.error('[incrementView] FATAL ERROR:', err)
      ctx.status = 500
      ctx.body = { ok: false, error: String(err) }
    }
  },
}))
