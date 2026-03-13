import { createHash } from 'node:crypto';
import type { Core } from '@strapi/strapi';
import { runWithRequestContext, type RequestActor } from '../utils/request-context';

function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

function resolveActor(ctx: any): RequestActor {
  const admin = ctx.state?.admin;
  if (admin) {
    const displayName =
      [admin.firstname, admin.lastname].filter(Boolean).join(' ').trim() ||
      admin.username ||
      admin.email ||
      null;

    return {
      type: 'admin',
      id: typeof admin.id === 'number' ? admin.id : null,
      displayName,
      email: admin.email ?? null,
    };
  }

  const user = ctx.state?.user;
  if (user) {
    return {
      type: 'user',
      id: typeof user.id === 'number' ? user.id : null,
      displayName: user.fullName ?? user.username ?? user.email ?? null,
      email: user.email ?? null,
    };
  }

  return {
    type: 'guest',
    id: null,
    displayName: null,
    email: null,
  };
}

export default (_config: unknown, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx: any, next: () => Promise<unknown>) => {
    const forwardedIp = (ctx.request.headers['x-forwarded-for'] as string | undefined)
      ?.split(',')[0]
      ?.trim();
    const rawIp = forwardedIp || ctx.request.ip || 'unknown';
    const requestIdHeader = ctx.request.headers['x-request-id'];
    const requestId = Array.isArray(requestIdHeader) ? requestIdHeader[0] : requestIdHeader ?? null;

    return runWithRequestContext(
      {
        actor: resolveActor(ctx),
        method: ctx.request.method,
        path: ctx.request.path,
        ip: rawIp,
        ipHash: hashIp(rawIp),
        userAgent: ctx.request.headers['user-agent'] ?? null,
        requestId,
      },
      async () => {
        try {
          await next();
        } catch (error) {
          strapi.log.error('[request-context] request failed', error);
          throw error;
        }
      }
    );
  };
};
