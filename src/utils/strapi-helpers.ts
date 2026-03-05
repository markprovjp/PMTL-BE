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
  return (strapi.documents as any)(uid).findOne({ documentId, status: 'published' });
}
