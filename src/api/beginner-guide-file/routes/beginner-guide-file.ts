import { factories } from '@strapi/strapi';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default (factories as any).createCoreRouter('api::beginner-guide-file.beginner-guide-file', {
  config: {
    find: { auth: false },
    findOne: { auth: false },
  },
});
