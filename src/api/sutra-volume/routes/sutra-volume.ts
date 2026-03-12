import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::sutra-volume.sutra-volume' as any, {
  config: {
    find: { auth: false },
    findOne: { auth: false },
  },
});

