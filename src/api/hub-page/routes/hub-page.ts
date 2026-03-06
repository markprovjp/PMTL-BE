/**
 * hub-page routes (Strapi v5)
 * core router — find + findOne công khai.
 */
import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::hub-page.hub-page', {
  config: {
    find: { auth: false, policies: [] },
    findOne: { auth: false, policies: [] },
  },
});
