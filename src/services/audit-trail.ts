import type { Core } from '@strapi/strapi';
import { getChangedTopLevelFields } from '../utils/object-diff';
import { getRequestContext, type RequestActor } from '../utils/request-context';

const AUDIT_LOG_UID = 'api::audit-log.audit-log';
const CONTENT_HISTORY_UID = 'api::content-history.content-history';

const SKIPPED_UIDS = new Set([
  AUDIT_LOG_UID,
  CONTENT_HISTORY_UID,
  'api::request-guard.request-guard',
]);

type AuditAction = 'create' | 'update' | 'delete' | 'publish' | 'unpublish';

type PersistAuditOptions = {
  uid: string;
  action: AuditAction;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  requestOverride?: {
    actor?: RequestActor;
  };
};

function normalizeActor(actor: RequestActor | null | undefined): RequestActor {
  return actor ?? { type: 'system', id: null, displayName: 'system', email: null };
}

function resolveTargetLabel(entry: Record<string, unknown> | null): string | null {
  if (!entry) return null;

  const candidates = ['title', 'name', 'slug', 'authorName', 'author_name'];
  for (const key of candidates) {
    const value = entry[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim().slice(0, 255);
    }
  }

  const documentId = entry.documentId;
  if (typeof documentId === 'string' && documentId) {
    return documentId;
  }

  return null;
}

export function shouldTrackAudit(uid: string) {
  return uid.startsWith('api::') && !SKIPPED_UIDS.has(uid);
}

async function getNextVersionNumber(strapi: Core.Strapi, uid: string, documentId: string) {
  const total = await (strapi.documents as any)(CONTENT_HISTORY_UID).count({
    filters: {
      targetUid: { $eq: uid },
      targetDocumentId: { $eq: documentId },
    },
  });

  return Number(total ?? 0) + 1;
}

export async function persistAuditTrail(
  strapi: Core.Strapi,
  options: PersistAuditOptions
) {
  if (!shouldTrackAudit(options.uid)) {
    return;
  }

  const requestContext = getRequestContext();
  const actor = normalizeActor(options.requestOverride?.actor ?? requestContext?.actor);
  const target = options.after ?? options.before;
  const targetDocumentId =
    typeof target?.documentId === 'string' ? target.documentId : null;
  const targetId = typeof target?.id === 'number' ? target.id : null;
  const changedFields = getChangedTopLevelFields(options.before, options.after);

  await (strapi.documents as any)(AUDIT_LOG_UID).create({
    data: {
      action: options.action,
      targetUid: options.uid,
      targetDocumentId,
      targetId,
      targetLabel: resolveTargetLabel(target),
      actorType: actor.type,
      actorId: actor.id,
      actorDisplayName: actor.displayName,
      actorEmail: actor.email,
      requestMethod: requestContext?.method ?? null,
      requestPath: requestContext?.path ?? null,
      requestId: requestContext?.requestId ?? null,
      ipHash: requestContext?.ipHash ?? null,
      userAgent: requestContext?.userAgent ?? null,
      changedFields,
      metadata: {
        beforeStatus: options.before?.publishedAt ? 'published' : 'draft',
        afterStatus: options.after?.publishedAt ? 'published' : 'draft',
      },
    },
  });

  if (!targetDocumentId) {
    return;
  }

  const shouldSaveHistory =
    options.action === 'create' ||
    options.action === 'delete' ||
    options.action === 'publish' ||
    options.action === 'unpublish' ||
    changedFields.length > 0;

  if (!shouldSaveHistory) {
    return;
  }

  const versionNumber = await getNextVersionNumber(strapi, options.uid, targetDocumentId);

  await (strapi.documents as any)(CONTENT_HISTORY_UID).create({
    data: {
      targetUid: options.uid,
      targetDocumentId,
      targetId,
      targetLabel: resolveTargetLabel(target),
      action: options.action,
      versionNumber,
      actorType: actor.type,
      actorId: actor.id,
      actorDisplayName: actor.displayName,
      actorEmail: actor.email,
      changedFields,
      snapshot: options.after ?? options.before ?? {},
      metadata: {
        requestMethod: requestContext?.method ?? null,
        requestPath: requestContext?.path ?? null,
        requestId: requestContext?.requestId ?? null,
      },
    },
  });
}
