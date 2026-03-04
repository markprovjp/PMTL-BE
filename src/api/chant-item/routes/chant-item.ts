import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::chant-item.chant-item', {
  config: {
    find: { auth: false },
    findOne: { auth: false },
  },
});
