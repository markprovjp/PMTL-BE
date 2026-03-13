import type { Core } from '@strapi/strapi';
import {
  BLOG_POST_MEILISEARCH_ENTRIES_QUERY,
  BLOG_POST_MEILISEARCH_INDEX,
  BLOG_POST_MEILISEARCH_SETTINGS,
  transformBlogPostSearchEntry,
} from '../src/search/blog-post-search';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => {
  const redisEnabled = env.bool('REDIS_ENABLED', Boolean(env('REDIS_HOST')));
  const bullmqEnabled = env.bool('BULLMQ_ENABLED', redisEnabled);
  const redisConnection: Record<string, unknown> = {
    host: env('REDIS_HOST', '127.0.0.1'),
    port: env.int('REDIS_PORT', 6379),
    maxRetriesPerRequest: null,
  };

  const redisUsername = env('REDIS_USERNAME', '');
  const redisPassword = env('REDIS_PASSWORD', '');

  if (redisUsername) {
    redisConnection.username = redisUsername;
  }

  if (redisPassword) {
    redisConnection.password = redisPassword;
  }

  return ({
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
        defaultFrom: env('SMTP_FROM', 'no-reply@phapmontamlinh-quantheambotat.vn'),
        defaultReplyTo: env('SMTP_REPLY_TO', 'contact@phapmontamlinh-quantheambotat.vn'),
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

  // ── Admin productivity plugins ─────────────────────────────
  'strapi-import-export': {
    enabled: true,
  },

  'duplicate-button': {
    enabled: true,
  },

  oembed: {
    enabled: true,
  },

  'strapi-calendar': {
    enabled: true,
  },

  'lucide-icon-picker': {
    enabled: true,
  },

  redis: redisEnabled ? {
    enabled: true,
    config: {
      connections: {
        queue: {
          connection: redisConnection,
        },
      },
    },
  } : {
    enabled: false,
  },

  bullmq: bullmqEnabled ? {
    enabled: true,
    config: {
      connectionName: 'queue',
    },
  } : {
    enabled: false,
  },

  // ── Meilisearch ──────────────────────────
  meilisearch: env.bool('MEILISEARCH_ENABLED', Boolean(env('MEILISEARCH_HOST'))) ? {
    config: {
      host: env('MEILISEARCH_HOST', 'http://localhost:7700'),
      apiKey: env('MEILISEARCH_API_KEY', ''),
      'blog-post': {
        indexName: env('MEILISEARCH_BLOG_POST_INDEX', BLOG_POST_MEILISEARCH_INDEX),
        entriesQuery: BLOG_POST_MEILISEARCH_ENTRIES_QUERY,
        settings: BLOG_POST_MEILISEARCH_SETTINGS,
        transformEntry: transformBlogPostSearchEntry,
      },
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
};

export default config;
