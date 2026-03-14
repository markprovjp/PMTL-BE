export default {
  routes: [
    {
      method: 'GET',
      path: '/chant-preferences/my',
      handler: 'chant-preference.findMyPreference',
      config: {
        auth: {},
      },
    },
    {
      method: 'PUT',
      path: '/chant-preferences/my',
      handler: 'chant-preference.upsertMyPreference',
      config: {
        auth: {},
      },
    },
  ],
};
