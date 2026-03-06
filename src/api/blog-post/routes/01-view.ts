/**
 * 01-view.ts — Blog-post view counter route (Strapi v5)
 * POST /api/blog-posts/:documentId/view — atomic increment, no auth
 */
export default {
  routes: [
    {
      method: 'POST',
      path: '/blog-posts/:documentId/view',
      handler: 'blog-post.incrementView',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
}
