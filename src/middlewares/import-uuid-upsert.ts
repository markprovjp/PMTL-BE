import type { Core } from '@strapi/strapi';

const IMPORT_PATH = '/export-import-kkm/import';
const UUID_CHUNK_SIZE = 100;

function isPluginImportRequest(ctx: any) {
  return ctx.request.method === 'POST' && String(ctx.request.path || '').endsWith(IMPORT_PATH);
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export default (_config: unknown, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx: any, next: () => Promise<unknown>) => {
    if (!isPluginImportRequest(ctx)) {
      await next();
      return;
    }

    try {
      const payload = ctx.request.body?.data;
      const collectionName = payload?.collectionName;
      const rows = payload?.rows;

      if (typeof collectionName !== 'string' || !Array.isArray(rows) || rows.length === 0) {
        await next();
        return;
      }

      const uid = `api::${collectionName}.${collectionName}`;
      const contentType = strapi.contentTypes?.[uid];
      const hasUuidField = Boolean(contentType?.attributes?.uuid);

      if (!hasUuidField) {
        await next();
        return;
      }

      const uuids = Array.from(
        new Set(
          rows
            .map((row: Record<string, unknown>) => row?.uuid)
            .filter((value: unknown): value is string => typeof value === 'string' && value.trim().length > 0)
            .map((value: string) => value.trim())
        )
      );

      if (uuids.length === 0) {
        await next();
        return;
      }

      const documentIdByUuid = new Map<string, string>();
      for (const uuidChunk of chunk(uuids, UUID_CHUNK_SIZE)) {
        const existingRows = await (strapi.documents(uid as any) as any).findMany({
          filters: { uuid: { $in: uuidChunk } },
          fields: ['uuid', 'documentId'],
          limit: uuidChunk.length,
        });

        for (const entry of existingRows ?? []) {
          const uuid = typeof entry?.uuid === 'string' ? entry.uuid.trim() : '';
          const documentId = typeof entry?.documentId === 'string' ? entry.documentId : '';
          if (uuid && documentId) {
            documentIdByUuid.set(uuid, documentId);
          }
        }
      }

      for (const row of rows as Array<Record<string, unknown>>) {
        const uuid = typeof row?.uuid === 'string' ? row.uuid.trim() : '';
        if (!uuid) continue;

        const resolvedDocumentId = documentIdByUuid.get(uuid);
        if (resolvedDocumentId) {
          row.documentId = resolvedDocumentId;
        }
      }
    } catch (error) {
      strapi.log.warn('[Import UUID Upsert] Failed to pre-map documentId by uuid', error);
    }

    await next();
  };
};
