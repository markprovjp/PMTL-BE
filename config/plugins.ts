import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  // ── Email via Nodemailer (SMTP) ───────────────────────────
  email: {
    config: {
      provider: '@strapi/provider-email-nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', 'smtp.gmail.com'),
        port: env.int('SMTP_PORT', 587),
        secure: env.bool('SMTP_SECURE', false),
        auth: {
          user: env('SMTP_USER', ''),
          pass: env('SMTP_PASS', ''),
        },
      },
      settings: {
        defaultFrom: env('SMTP_FROM', 'no-reply@phapmontamlinh.vn'),
        defaultReplyTo: env('SMTP_REPLY_TO', 'contact@phapmontamlinh.vn'),
      },
    },
  },

  // ── Users & Permissions ──────────────────────────────────────
  'users-permissions': {
    config: {
      jwtSecret: env('JWT_SECRET'),
      register: {
        allowedFields: ['fullName', 'phone', 'address', 'avatar_url', 'bio', 'dharmaName'],
      },
      providers: {
        google: {
          enabled: Boolean(env('GOOGLE_CLIENT_ID')) && Boolean(env('GOOGLE_CLIENT_SECRET')),
          icon: 'google',
          key: env('GOOGLE_CLIENT_ID'),
          secret: env('GOOGLE_CLIENT_SECRET'),
          callback: `${env('FRONTEND_URL', 'http://localhost:3000')}/auth/google/callback`,
          scope: ['openid', 'email', 'profile'],
        },
      },
    },
  },

  // ── CKEditor ───────────────────────────────────────────────
  ckeditor5: {
    enabled: true,
  },

  // ── Meilisearch ──────────────────────────
  meilisearch: env.bool('MEILISEARCH_ENABLED', Boolean(env('MEILISEARCH_HOST'))) ? {
    config: {
      host: env('MEILISEARCH_HOST', 'http://localhost:7700'),
      apiKey: env('MEILISEARCH_API_KEY', ''),
    },
  } : {
    enabled: false,
  },

  // ── OpenAPI / Swagger ──────────────────────────
  documentation: {
    enabled: true,
    config: {
      openapi: '3.0.0',
      info: {
        version: '1.0.0',
        title: 'PMTL Backend API',
        description: 'Tài liệu OpenAPI cho BE PMTL',
      },
      'x-strapi-config': {
        path: '/documentation',
        showIncludedCustomResponses: false,
      },
    },
  },
});

export default config;
