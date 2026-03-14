export default {
  routes: [
    {
      method: 'GET',
      path: '/chant-plans/today-chant/my',
      handler: 'chant-plan.getTodayChantMy',
      config: {
        auth: {},
        description: 'Aggregator có merge cấu hình cá nhân và cấu hình hôm nay',
      },
    },
  ],
};
