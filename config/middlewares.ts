import type { Core } from '@strapi/strapi';

const config: Core.Config.Middlewares = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'res.cloudinary.com', 'lh3.googleusercontent.com', 'phapmontamlinh.vn'],
          'media-src': ["'self'", 'data:', 'blob:', 'res.cloudinary.com', 'lh3.googleusercontent.com', 'phapmontamlinh.vn'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://phapmontamlinh.vn',
        'https://www.phapmontamlinh.vn',
      ],
      credentials: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
