import type { Core } from '@strapi/strapi';

const REQUEST_GUARD_UID = 'api::request-guard.request-guard';

type GuardConsumeOptions = {
  scope: string;
  key: string;
  windowMs: number;
  maxHits?: number;
  notes?: Record<string, unknown>;
};

type GuardConsumeResult = {
  allowed: boolean;
  retryAfterMs: number;
  hits: number;
};

function buildGuardKey(scope: string, key: string) {
  return `${scope}:${key}`;
}

export async function consumeGuard(
  strapi: Core.Strapi,
  options: GuardConsumeOptions
): Promise<GuardConsumeResult> {
  const now = new Date();
  const nowMs = now.getTime();
  const maxHits = options.maxHits ?? 1;
  const expiresAt = new Date(nowMs + options.windowMs);
  const guardKey = buildGuardKey(options.scope, options.key);
  const query = strapi.db.query(REQUEST_GUARD_UID as any);

  const existing = await query.findOne({
    where: { guardKey },
    select: ['id', 'documentId', 'hits', 'expiresAt'],
  });

  if (!existing) {
    await (strapi.documents as any)(REQUEST_GUARD_UID).create({
      data: {
        guardKey,
        scope: options.scope,
        hits: 1,
        expiresAt: expiresAt.toISOString(),
        lastSeenAt: now.toISOString(),
        notes: options.notes ?? null,
      },
    });

    return { allowed: true, retryAfterMs: 0, hits: 1 };
  }

  const existingExpiresAt = existing.expiresAt ? new Date(existing.expiresAt).getTime() : 0;
  const isExpired = existingExpiresAt <= nowMs;

  if (isExpired) {
    await (strapi.documents as any)(REQUEST_GUARD_UID).update({
      documentId: existing.documentId,
      data: {
        scope: options.scope,
        hits: 1,
        expiresAt: expiresAt.toISOString(),
        lastSeenAt: now.toISOString(),
        notes: options.notes ?? null,
      },
    });

    return { allowed: true, retryAfterMs: 0, hits: 1 };
  }

  const nextHits = Number(existing.hits ?? 0) + 1;
  const retryAfterMs = Math.max(0, existingExpiresAt - nowMs);

  if (nextHits > maxHits) {
    await (strapi.documents as any)(REQUEST_GUARD_UID).update({
      documentId: existing.documentId,
      data: {
        hits: nextHits,
        lastSeenAt: now.toISOString(),
        notes: options.notes ?? null,
      },
    });

    return {
      allowed: false,
      retryAfterMs,
      hits: nextHits,
    };
  }

  await (strapi.documents as any)(REQUEST_GUARD_UID).update({
    documentId: existing.documentId,
    data: {
      hits: nextHits,
      lastSeenAt: now.toISOString(),
      notes: options.notes ?? null,
    },
  });

  return {
    allowed: true,
    retryAfterMs,
    hits: nextHits,
  };
}

export async function cleanupExpiredGuards(strapi: Core.Strapi, limit = 200) {
  const now = new Date().toISOString();
  const expired = await (strapi.documents as any)(REQUEST_GUARD_UID).findMany({
    filters: {
      expiresAt: { $lt: now },
    },
    fields: ['documentId'],
    sort: ['expiresAt:asc'],
    limit,
  });

  for (const item of expired) {
    if (!item?.documentId) continue;
    await (strapi.documents as any)(REQUEST_GUARD_UID).delete({
      documentId: item.documentId,
    });
  }

  return expired.length;
}
