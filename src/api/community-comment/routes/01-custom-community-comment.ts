/**
 * custom-community-comment routes (Strapi v5)
 * Gửi bình luận và like - không cần xác thực.
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/community-comments/submit',
      handler: 'community-comment.createComment',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/community-comments/like/:documentId',
      handler: 'community-comment.likeComment',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/community-comments/report/:documentId',
      handler: 'community-comment.reportComment',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
