import type { Core } from '@strapi/strapi';

const config: Core.Config.Api = {
  rest: {
    defaultLimit: 25,
    maxLimit: 100,
  },
};

export default config;
