/**
 * custom-community-post routes (Strapi v5)
 * Đăng bài và like - không cần xác thực.
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/community-posts/submit',
      handler: 'community-post.createPost',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/community-posts/like/:identifier',
      handler: 'community-post.like',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/community-posts/:identifier/view',
      handler: 'community-post.incrementView',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/community-posts/report/:identifier',
      handler: 'community-post.report',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
