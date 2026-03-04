import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::lunar-event-chant-override.lunar-event-chant-override', {
  config: {
    find: { auth: false },
    findOne: { auth: false },
  },
});
