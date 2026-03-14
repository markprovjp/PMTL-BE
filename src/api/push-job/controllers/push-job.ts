import { factories } from '@strapi/strapi';
import { enqueuePushDispatch } from '../../../services/push-queue';
import { createLogger } from '../../../utils/logger';

const UID = 'api::push-job.push-job';

function getPendingDocumentId(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;

  const record = payload as Record<string, unknown>;
  const status = record.status;
  const documentId = record.documentId;

  if (status !== 'pending') return null;
  return typeof documentId === 'string' && documentId.length > 0 ? documentId : null;
}

export default factories.createCoreController(UID, ({ strapi }) => ({
  async create(ctx) {
    const log = createLogger(strapi, 'push-job');
    const response = await super.create(ctx);
    const documentId = getPendingDocumentId(response?.data);

    if (documentId) {
      const queued = await enqueuePushDispatch(strapi, documentId);
      if (!queued) {
        log.warn('create enqueue skipped', { documentId });
      }
    }

    return response;
  },

  async update(ctx) {
    const log = createLogger(strapi, 'push-job');
    const response = await super.update(ctx);
    const documentId = getPendingDocumentId(response?.data);

    if (documentId) {
      const queued = await enqueuePushDispatch(strapi, documentId);
      if (!queued) {
        log.warn('update enqueue skipped', { documentId });
      }
    }

    return response;
  },
}));
