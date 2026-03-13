import { enqueuePushDispatch } from '../../../../services/push-queue';

function getDocumentId(result: Record<string, unknown> | null | undefined) {
  const documentId = result?.documentId;
  return typeof documentId === 'string' && documentId.length > 0 ? documentId : null;
}

function shouldQueue(result: Record<string, unknown> | null | undefined) {
  return result?.status === 'pending';
}

export default {
  async afterCreate(event) {
    if (!shouldQueue(event.result)) {
      return;
    }

    const documentId = getDocumentId(event.result);
    if (!documentId) {
      return;
    }

    await enqueuePushDispatch(strapi, documentId);
  },

  async afterUpdate(event) {
    if (!shouldQueue(event.result)) {
      return;
    }

    const documentId = getDocumentId(event.result);
    if (!documentId) {
      return;
    }

    await enqueuePushDispatch(strapi, documentId);
  },
};
