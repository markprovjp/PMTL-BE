export default {
  routes: [
    {
      method: 'GET',
      path: '/blog-reader-states/my',
      handler: 'blog-reader-state.listMyStates',
      config: {
        policies: [],
        middlewares: ['plugin::strapi-plugin-rate-limit.rate-limit'],
      },
    },
    {
      method: 'GET',
      path: '/blog-reader-states/my/posts',
      handler: 'blog-reader-state.listMyPosts',
      config: {
        policies: [],
        middlewares: ['plugin::strapi-plugin-rate-limit.rate-limit'],
      },
    },
    {
      method: 'GET',
      path: '/blog-reader-states/my/summary',
      handler: 'blog-reader-state.summary',
      config: {
        policies: [],
        middlewares: ['plugin::strapi-plugin-rate-limit.rate-limit'],
      },
    },
    {
      method: 'POST',
      path: '/blog-reader-states/my',
      handler: 'blog-reader-state.upsertMyState',
      config: {
        policies: [],
        middlewares: ['plugin::strapi-plugin-rate-limit.rate-limit'],
      },
    },
  ],
}
