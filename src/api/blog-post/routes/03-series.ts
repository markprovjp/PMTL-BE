/**
 * 03-series.ts — Blog-post series routes (Strapi v5)
 * Lấy các bài cùng chuyên đề.
 */
export default {
  routes: [
    {
      method: 'GET',
      path: '/blog-posts/series/:seriesKey',
      handler: 'blog-post.series',
      config: { auth: false, policies: [], middlewares: [] },
    },
  ],
};
