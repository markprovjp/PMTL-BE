/**
 * Custom route cho lunar-events — populate relatedBlogs qua Document Service
 * Prefix "01-" dam bao route nay duoc load TRUOC core router (tranh Strapi mapping sang documentId)
 *
 * Endpoint: GET /api/lunar-events/with-blogs
 * Auth: khong can — dung trong public frontend
 */
export default {
  routes: [
    {
      method: 'GET',
      path: '/lunar-events/with-blogs',
      handler: 'lunar-event.findWithBlogs',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
