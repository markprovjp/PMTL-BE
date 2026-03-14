import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::chanting-setting.chanting-setting', {
  config: {
    find: { auth: false },
  },
});
