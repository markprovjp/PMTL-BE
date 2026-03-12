import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::sutra.sutra' as any, {
  config: {
    find: { auth: false },
    findOne: { auth: false },
  },
});

