/**
 * 01-view.ts — Blog-post view counter route (Strapi v5)
 * POST /api/blog-posts/:identifier/view — atomic increment, no auth
 */
export default {
  routes: [
    {
      method: 'POST',
      path: '/blog-posts/:identifier/view',
      handler: 'blog-post.incrementView',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
}
