import type { Core } from '@strapi/strapi';

/**
 * Atomic increment of a numeric field using raw SQL (Knex).
 * Updates all rows (draft + published) with the given documentId in one query.
 * Returns the new value read back from the first matching row.
 */
export async function atomicIncrementField(
  strapi: Core.Strapi,
  uid: string,
  documentId: string,
  field: string
): Promise<number> {
  const meta = strapi.db.metadata.get(uid);
  if (!meta?.tableName) throw new Error(`atomicIncrementField: Unknown UID "${uid}"`);

  const conn = (strapi.db as any).connection;
  await conn(meta.tableName).where({ document_id: documentId }).increment(field, 1);

  const row = await conn(meta.tableName)
    .where({ document_id: documentId })
    .select(field)
    .first();

  return (row?.[field] as number) ?? 0;
}

/**
 * Shorthand findOne with status: published.
 */
export async function findPublished(
  strapi: Core.Strapi,
  uid: string,
  documentId: string
): Promise<any | null> {
  const results = await (strapi.documents(uid as any) as any).findMany({
    filters: { documentId },
    status: 'published',
    limit: 1,
  });
  return results?.[0] || null;
}

export function buildDocumentIdentifierFilters(identifier: string) {
  return {
    $or: [
      { documentId: { $eq: identifier } },
      { uuid: { $eq: identifier } },
    ],
  };
}

export async function resolveDocumentIdByIdentifier(
  strapi: Core.Strapi,
  uid: string,
  identifier: string,
  options?: {
    status?: 'published' | 'draft';
    filters?: Record<string, unknown>;
  }
): Promise<string | null> {
  const query = strapi.db.query(uid as any);
  const statusFilter =
    options?.status === 'published'
      ? { publishedAt: { $notNull: true } }
      : options?.status === 'draft'
        ? { publishedAt: { $null: true } }
        : null;

  const where = {
    ...(options?.filters ?? {}),
    ...(statusFilter ?? {}),
    $or: [
      { documentId: identifier },
      { uuid: identifier },
    ],
  };

  const result = await query.findOne({
    where,
    select: ['documentId'],
  });

  return (result?.documentId as string | undefined) ?? null;
}
