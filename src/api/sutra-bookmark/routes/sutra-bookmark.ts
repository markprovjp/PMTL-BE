export default {
  routes: [
    {
      method: 'GET',
      path: '/sutra-bookmarks/my',
      handler: 'sutra-bookmark.listMyBookmarks',
      config: {
        policies: [],
        middlewares: ['plugin::strapi-plugin-rate-limit.rate-limit'],
      },
    },
    {
      method: 'POST',
      path: '/sutra-bookmarks/my',
      handler: 'sutra-bookmark.createMyBookmark',
      config: {
        policies: [],
        middlewares: ['plugin::strapi-plugin-rate-limit.rate-limit'],
      },
    },
    {
      method: 'DELETE',
      path: '/sutra-bookmarks/my/:documentId',
      handler: 'sutra-bookmark.deleteMyBookmark',
      config: {
        policies: [],
        middlewares: ['plugin::strapi-plugin-rate-limit.rate-limit'],
      },
    },
  ],
};
