/**
 * community-comment router (Strapi v5)
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::community-comment.community-comment', {
  config: {
    find: { auth: false },
    findOne: { auth: false },
  },
});
