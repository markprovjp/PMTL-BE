export default {
  routes: [
    {
      method: 'GET',
      path: '/sutra-bookmarks/my',
      handler: 'sutra-bookmark.listMyBookmarks',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/sutra-bookmarks/my',
      handler: 'sutra-bookmark.createMyBookmark',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/sutra-bookmarks/my/:documentId',
      handler: 'sutra-bookmark.deleteMyBookmark',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};

