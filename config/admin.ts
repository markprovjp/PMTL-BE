import type { Core } from '@strapi/strapi';

type PreviewDocument = {
  slug?: string | null;
};

const normalizeAllowedOrigins = (clientUrl: string, rawAllowedOrigins?: string): string[] => {
  const source = rawAllowedOrigins ?? clientUrl;
  return source
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const getPreviewPathname = (uid: string, document: PreviewDocument | null): string | null => {
  const slug = document?.slug ?? null;

  switch (uid) {
    case 'api::setting.setting':
      return '/';
    case 'api::sidebar-config.sidebar-config':
      return '/';
    case 'api::blog-post.blog-post':
      return slug ? `/blog/${slug}` : '/blog';
    case 'api::event.event':
      return slug ? `/events/${slug}` : '/events';
    case 'api::hub-page.hub-page':
      return slug ? `/hub/${slug}` : '/hub';
    case 'api::category.category':
      return slug ? `/category/${slug}` : '/blog';
    case 'api::blog-tag.blog-tag':
      return slug ? `/tag/${slug}` : '/blog';
    case 'api::sutra.sutra':
      return slug ? `/kinh-dien/${slug}` : '/kinh-dien';
    case 'api::beginner-guide.beginner-guide':
      return '/beginner-guide';
    case 'api::download-item.download-item':
      return '/library';
    case 'api::gallery-item.gallery-item':
      return '/gallery';
    case 'api::guestbook-entry.guestbook-entry':
      return '/guestbook';
    case 'api::lunar-event.lunar-event':
      return '/lunar-calendar';
    case 'api::chant-item.chant-item':
    case 'api::chant-plan.chant-plan':
      return '/niem-kinh';
    default:
      return null;
  }
};

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Admin => {
  const clientUrl = env('CLIENT_URL', 'http://localhost:3000');
  const previewSecret = env('PREVIEW_SECRET');
  const previewRoute = env('PREVIEW_ROUTE', '/api/preview');

  return {
    auth: {
      secret: env('ADMIN_JWT_SECRET'),
      sessions: {
        maxRefreshTokenLifespan: 2592000, // 30 days
        maxSessionLifespan: 2592000,
      },
    },
    apiToken: {
      salt: env('API_TOKEN_SALT'),
    },
    transfer: {
      token: {
        salt: env('TRANSFER_TOKEN_SALT'),
      },
    },
    secrets: {
      encryptionKey: env('ENCRYPTION_KEY'),
    },
    flags: {
      nps: env.bool('FLAG_NPS', true),
      promoteEE: env.bool('FLAG_PROMOTE_EE', true),
    },
    preview: {
      enabled: env.bool('PREVIEW_ENABLED', true),
      config: {
        allowedOrigins: normalizeAllowedOrigins(clientUrl, env('PREVIEW_ALLOWED_ORIGINS')),
        async handler(uid, { documentId, status }) {
          const document = (await (strapi as any).documents(uid).findOne({
            documentId,
          })) as PreviewDocument | null;

          const pathname = getPreviewPathname(uid, document);
          if (!pathname) {
            return null;
          }

          if (!previewSecret) {
            const url = new URL(pathname, clientUrl);
            url.searchParams.set('status', status);
            return url.toString();
          }

          const searchParams = new URLSearchParams({
            url: pathname,
            secret: previewSecret,
            status,
          });
          return `${clientUrl}${previewRoute}?${searchParams.toString()}`;
        },
      },
    },
  };
};

export default config;
