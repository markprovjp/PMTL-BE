export default {
  routes: [
    {
      method: 'GET',
      path: '/chant-plans/today-chant',
      handler: 'chant-plan.getTodayChant',
      config: {
        auth: false,
        description: 'Aggregator: trả về Today Chant List sau khi merge lunar_events + overrides',
      },
    },
  ],
};
