import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::beginner-guide.beginner-guide', {
  config: {
    find: { auth: false },
    findOne: { auth: false },
  },
});
