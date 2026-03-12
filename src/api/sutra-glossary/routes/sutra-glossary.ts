import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::sutra-glossary.sutra-glossary' as any, {
  config: {
    find: { auth: false },
    findOne: { auth: false },
  },
});

