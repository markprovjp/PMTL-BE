/**
 * sidebar-config routes (Strapi v5) — SingleType
 * find (GET /sidebar-config) công khai.
 */
import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::sidebar-config.sidebar-config', {
  config: {
    find: { auth: false, policies: [] },
  },
});
