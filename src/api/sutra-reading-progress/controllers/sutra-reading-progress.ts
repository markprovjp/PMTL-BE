import { factories } from '@strapi/strapi';

const UID = 'api::sutra-reading-progress.sutra-reading-progress' as any;

export default factories.createCoreController(UID, ({ strapi }: any) => ({
  async findMyProgress(ctx: any) {
    const userId = ctx.state.user?.id;
    if (!userId) return ctx.unauthorized('Yêu cầu đăng nhập');

    const { chapterDocumentId, sutraDocumentId } = ctx.query as Record<string, string>;
    const filters: Record<string, unknown> = {
      user: { id: userId },
    };
    if (chapterDocumentId) filters.chapter = { documentId: { $eq: chapterDocumentId } };
    if (sutraDocumentId) filters.sutra = { documentId: { $eq: sutraDocumentId } };

    const entries = await strapi.documents(UID).findMany({
      filters,
      fields: ['documentId', 'anchorKey', 'charOffset', 'scrollPercent', 'lastReadAt', 'updatedAt'],
      populate: {
        sutra: { fields: ['documentId', 'title', 'slug'] },
        volume: { fields: ['documentId', 'title', 'slug', 'volumeNumber'] },
        chapter: { fields: ['documentId', 'title', 'slug', 'chapterNumber'] },
      },
      sort: ['updatedAt:desc'],
      limit: chapterDocumentId ? 1 : 50,
    });

    ctx.body = chapterDocumentId ? (entries[0] ?? null) : entries;
  },

  async upsertMyProgress(ctx: any) {
    const userId = ctx.state.user?.id;
    if (!userId) return ctx.unauthorized('Yêu cầu đăng nhập');

    const {
      sutraDocumentId,
      volumeDocumentId,
      chapterDocumentId,
      anchorKey,
      charOffset,
      scrollPercent,
    } = (ctx.request.body ?? {}) as Record<string, unknown>;

    if (!sutraDocumentId || !chapterDocumentId) {
      return ctx.badRequest('Thiếu sutraDocumentId hoặc chapterDocumentId');
    }

    const existing = await strapi.documents(UID).findMany({
      filters: {
        user: { id: userId },
        chapter: { documentId: { $eq: String(chapterDocumentId) } },
      },
      fields: ['documentId'],
      limit: 1,
    });
    const found = existing[0];

    const data: Record<string, unknown> = {
      anchorKey: anchorKey ? String(anchorKey) : null,
      charOffset: Number(charOffset ?? 0),
      scrollPercent: Math.max(0, Math.min(100, Number(scrollPercent ?? 0))),
      lastReadAt: new Date().toISOString(),
      sutra: { connect: [{ documentId: String(sutraDocumentId) }] },
      chapter: { connect: [{ documentId: String(chapterDocumentId) }] },
    };
    if (volumeDocumentId) {
      data.volume = { connect: [{ documentId: String(volumeDocumentId) }] };
    }

    let result;
    if (found?.documentId) {
      result = await strapi.documents(UID).update({
        documentId: found.documentId,
        data,
      });
    } else {
      result = await strapi.documents(UID).create({
        data: {
          user: userId,
          ...data,
        },
      });
    }

    ctx.body = result;
  },
}));

