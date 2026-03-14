export default {
  routes: [
    {
      method: 'GET',
      path: '/categories/tree',
      handler: 'category.tree',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/categories/breadcrumb/:slug',
      handler: 'category.breadcrumb',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
}
