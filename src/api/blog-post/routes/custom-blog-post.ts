/**
 * custom-blog-post routes
 * Extends the default CRUD router with custom endpoints.
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/blog-posts/:documentId/view',
      handler: 'blog-post.incrementView',
      config: {
        auth: false,      // public — no API token required
        policies: [],
        middlewares: [],
      },
    },
  ],
}
