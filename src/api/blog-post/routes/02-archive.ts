/**
 * 02-archive.ts — Blog-post archive routes (Strapi v5)
 * Lấy bài viết theo năm/tháng.
 */
export default {
  routes: [
    {
      method: 'GET',
      path: '/blog-posts/archive',
      handler: 'blog-post.archive',
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      method: 'GET',
      path: '/blog-posts/archive-index',
      handler: 'blog-post.archiveIndex',
      config: { auth: false, policies: [], middlewares: [] },
    },
  ],
};
