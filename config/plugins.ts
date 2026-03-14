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
  const redisUrl = env('REDIS_URL', '');
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

  const localAllowlistIps = env('NODE_ENV', 'development') === 'production'
    ? []
    : ['127.0.0.1', '::1'];

  const rateLimitRedisConfig = redisUrl
    ? {
        url: redisUrl,
        ...(env.bool('REDIS_TLS', redisUrl.startsWith('rediss://')) ? { tls: true } : {}),
      }
    : (redisEnabled
        ? {
            host: env('REDIS_HOST', '127.0.0.1'),
            port: env.int('REDIS_PORT', 6379),
            ...(redisPassword ? { password: redisPassword } : {}),
            ...(env.bool('REDIS_TLS', false) ? { tls: true } : {}),
          }
        : undefined);

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
  'export-import-kkm': {
    enabled: true,
  },

  'strapi-plugin-rate-limit': {
    enabled: true,
    config: {
      defaults: {
        limit: 180,
        interval: '1m',
        blockDuration: 0,
      },
      ...(rateLimitRedisConfig ? { redis: rateLimitRedisConfig } : {}),
      rules: [
        { path: '/api/auth/**', limit: 8, interval: '15m', blockDuration: 900 },
        { path: '/api/blog-comments/submit', limit: 12, interval: '10m', blockDuration: 300 },
        { path: '/api/community-comments/submit', limit: 12, interval: '10m', blockDuration: 300 },
        { path: '/api/community-posts/submit', limit: 8, interval: '10m', blockDuration: 600 },
        { path: '/api/guestbook-entries/submit', limit: 6, interval: '10m', blockDuration: 600 },
        { path: '/api/**/report/**', limit: 10, interval: '10m', blockDuration: 300 },
        { path: '/api/upload/**', limit: 20, interval: '5m', blockDuration: 300 },
        { path: '/api/push-subscriptions/**', limit: 60, interval: '1m', blockDuration: 60 },
        { path: '/api/blog-reader-states/**', limit: 240, interval: '1m', blockDuration: 0 },
        { path: '/api/practice-logs/**', limit: 120, interval: '1m', blockDuration: 0 },
        { path: '/api/sutra-bookmarks/**', limit: 120, interval: '1m', blockDuration: 0 },
      ],
      allowlist: {
        ips: localAllowlistIps,
        tokens: [],
        users: [],
      },
      exclude: [],
      cloudflare: env.bool('RATE_LIMIT_CLOUDFLARE', false),
      thresholdWarning: 0.85,
      keyPrefix: 'pmtl:rl',
      execEvenly: false,
      execEvenlyMinDelayMs: 0,
      inMemoryBlock: {
        enabled: true,
        consumedThreshold: 0,
        duration: '1m',
      },
      burst: {
        enabled: false,
        points: 10,
        duration: '10s',
      },
      maskClientIps: true,
      adminPollInterval: '10s',
    },
  },

  'tree-menus': {
    enabled: true,
    config: {
      fieldSchema: {
        attributes: [
          {
            id: 'title',
            label: 'Title',
            placeholder: 'Enter item title',
            type: 'text',
            validationType: 'string',
            value: 'New items',
            required: true,
            validations: [
              { type: 'required', params: ['this field is required'] },
              { type: 'max', params: [100, 'Title cannot be more than 100 characters'] },
              { type: 'default', params: ['New items'] },
            ],
          },
          {
            id: 'url',
            label: 'Url',
            placeholder: 'Enter url',
            type: 'text',
            validationType: 'string',
            value: '/',
            required: true,
            validations: [
              { type: 'required', params: ['this field is required'] },
              { type: 'max', params: [200, 'Url cannot be more than 200 characters'] },
              { type: 'default', params: ['/'] },
            ],
          },
          {
            id: 'target',
            label: 'Target',
            placeholder: 'Enter target',
            type: 'select',
            validationType: 'mixed',
            value: '_self',
            required: true,
            validations: [
              {
                type: 'oneOf',
                params: [
                  ['_blank', '_parent', '_self', '_top'],
                  'this field needs to be one of the following: _blank, _parent, _self, _top',
                ],
              },
              { type: 'default', params: ['_self'] },
            ],
            options: [
              { key: '_blank', value: '_blank', metadatas: { intlLabel: { id: 'tree-menus.target.options._blank', defaultMessage: 'New window (_blank)' }, disabled: false, hidden: false } },
              { key: '_parent', value: '_parent', metadatas: { intlLabel: { id: 'tree-menus.target.options._parent', defaultMessage: 'Parent window (_parent)' }, disabled: false, hidden: false } },
              { key: '_self', value: '_self', metadatas: { intlLabel: { id: 'tree-menus.target.options._self', defaultMessage: 'Same window (_self)' }, disabled: false, hidden: false } },
              { key: '_top', value: '_top', metadatas: { intlLabel: { id: 'tree-menus.target.options._top', defaultMessage: 'Top window (_top)' }, disabled: false, hidden: false } },
            ],
          },
          {
            id: 'isProtected',
            label: 'isProtected',
            placeholder: 'Choose isProtected',
            type: 'bool',
            validationType: 'boolean',
            value: false,
            required: true,
            validations: [
              { type: 'required', params: ['Need to choose isProtected'] },
              { type: 'default', params: [false] },
            ],
          },
          {
            id: 'categorySlug',
            label: 'Category slug',
            placeholder: 'noi-dung-chuyen-muc',
            type: 'text',
            validationType: 'string',
            value: '',
            required: false,
            validations: [{ type: 'max', params: [120, 'Category slug cannot be more than 120 characters'] }],
          },
          {
            id: 'categoryUuid',
            label: 'Category UUID',
            placeholder: 'uuid of linked category',
            type: 'text',
            validationType: 'string',
            value: '',
            required: false,
            validations: [{ type: 'max', params: [120, 'Category UUID cannot be more than 120 characters'] }],
          },
          {
            id: 'iconKey',
            label: 'Icon key',
            placeholder: 'book-open',
            type: 'text',
            validationType: 'string',
            value: '',
            required: false,
            validations: [{ type: 'max', params: [80, 'Icon key cannot be more than 80 characters'] }],
          },
        ],
      },
    },
  },

  'soft-delete': {
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
