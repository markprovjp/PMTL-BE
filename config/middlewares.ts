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
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'res.cloudinary.com',
            'lh3.googleusercontent.com',
            'phapmontamlinh.vn',
            'phapmontamlinh-quantheambotat.vn',
            'www.phapmontamlinh-quantheambotat.vn',
            'strapi.phapmontamlinh-quantheambotat.vn',
            'strapi.io',
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'res.cloudinary.com',
            'lh3.googleusercontent.com',
            'phapmontamlinh.vn',
            'phapmontamlinh-quantheambotat.vn',
            'www.phapmontamlinh-quantheambotat.vn',
            'strapi.phapmontamlinh-quantheambotat.vn',
            'strapi.io',
          ],
          'script-src': ["'self'", 'https:', "'unsafe-inline'", 'strapi.io'],
          'frame-src': ["'self'", 'https:', 'www.youtube.com', 'youtube.com', 'vimeo.com'],
          'frame-ancestors': [
            "'self'",
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:1337',
            'https://phapmontamlinh.vn',
            'https://www.phapmontamlinh.vn',
            'https://phapmontamlinh-quantheambotat.vn',
            'https://www.phapmontamlinh-quantheambotat.vn',
            'https://strapi.phapmontamlinh-quantheambotat.vn',
          ],
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
        'https://phapmontamlinh-quantheambotat.vn',
        'https://www.phapmontamlinh-quantheambotat.vn',
        'https://strapi.phapmontamlinh-quantheambotat.vn',
      ],
      credentials: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'global::request-context',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
