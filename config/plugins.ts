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
    },
  },

  // ── CKEditor ───────────────────────────────────────────────
  ckeditor5: {
    enabled: true,
  },

  // ── Meilisearch ──────────────────────────
  meilisearch: {
    config: {
      host: env('MEILISEARCH_HOST', 'http://localhost:7700'),
      apiKey: env('MEILISEARCH_API_KEY', 'super-secret-key-12345'),
    },
  },
});

export default config;
