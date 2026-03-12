import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::sutra-chapter.sutra-chapter' as any, {
  config: {
    find: { auth: false },
    findOne: { auth: false },
  },
});

