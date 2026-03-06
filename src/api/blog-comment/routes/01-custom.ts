/**
 * 01-custom.ts — Blog-comment custom routes (Strapi v5)
 *
 * QUAN TRỌNG: File phải đặt tên bắt đầu bằng số để nạp TRƯỚC core router,
 * tránh nhầm lẫn đường dẫn với /:documentId.
 */
export default {
  routes: [
    {
      method: 'POST',
      path: '/blog-comments/submit',
      handler: 'blog-comment.submit',
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      method: 'POST',
      path: '/blog-comments/like/:documentId',
      handler: 'blog-comment.like',
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      method: 'GET',
      path: '/blog-comments/by-post/:slug',
      handler: 'blog-comment.byPost',
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      method: 'GET',
      path: '/blog-comments/latest',
      handler: 'blog-comment.latest',
      config: { auth: false, policies: [], middlewares: [] },
    },
  ],
};
