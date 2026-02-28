/**
 * community-post router (Strapi v5)
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::community-post.community-post', {
  config: {
    find: { auth: false },
    findOne: { auth: false },
  },
});
