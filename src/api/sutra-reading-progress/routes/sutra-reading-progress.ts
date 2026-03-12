export default {
  routes: [
    {
      method: 'GET',
      path: '/sutra-reading-progresses/my',
      handler: 'sutra-reading-progress.findMyProgress',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/sutra-reading-progresses/my',
      handler: 'sutra-reading-progress.upsertMyProgress',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};

