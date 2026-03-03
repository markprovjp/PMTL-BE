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
          'connect-src': ["'self'", 'https:', 'strapi.io'],
          'img-src': ["'self'", 'data:', 'blob:', 'res.cloudinary.com', 'lh3.googleusercontent.com', 'phapmontamlinh.vn', 'strapi.io'],
          'media-src': ["'self'", 'data:', 'blob:', 'res.cloudinary.com', 'lh3.googleusercontent.com', 'phapmontamlinh.vn', 'strapi.io'],
          'script-src': ["'self'", 'https:', "'unsafe-inline'", 'strapi.io'],
          'frame-src': ["'self'", 'https:', 'www.youtube.com', 'youtube.com', 'vimeo.com'],
          'frame-ancestors': ["'self'", 'http://localhost:3000', 'http://localhost:3001', 'https://phapmontamlinh.vn', 'https://www.phapmontamlinh.vn', 'http://localhost:1337'],
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
