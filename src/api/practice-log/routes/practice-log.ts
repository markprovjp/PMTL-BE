export default {
  routes: [
    {
      method: 'GET',
      path: '/practice-logs/my',
      handler: 'practice-log.findMyLog',
      config: {
        // Yêu cầu JWT user auth (không phải API token)
        policies: [],
        middlewares: ['plugin::strapi-plugin-rate-limit.rate-limit'],
      },
    },
    {
      method: 'PUT',
      path: '/practice-logs/my',
      handler: 'practice-log.upsertMyLog',
      config: {
        policies: [],
        middlewares: ['plugin::strapi-plugin-rate-limit.rate-limit'],
      },
    },
  ],
};
