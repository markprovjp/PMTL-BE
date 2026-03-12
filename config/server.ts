import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Server => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  // Strapi v5 expects `server.proxy.koa` to enable Koa proxy trust (X-Forwarded-*),
  // otherwise OAuth flows can fail with: "Cannot send secure cookie over unencrypted connection".
  proxy: { koa: true },
  url: env('PUBLIC_URL', 'http://localhost:1337'),
  app: {
    keys: env.array('APP_KEYS'),
  },
});

export default config;
