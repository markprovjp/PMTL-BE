import { factories } from '@strapi/strapi';

const UID = 'api::sutra-bookmark.sutra-bookmark' as any;

export default factories.createCoreController(UID, ({ strapi }: any) => ({
  async listMyBookmarks(ctx: any) {
    const userId = ctx.state.user?.id;
    if (!userId) return ctx.unauthorized('Yêu cầu đăng nhập');

    const { sutraDocumentId, chapterDocumentId } = ctx.query as Record<string, string>;
    const filters: Record<string, unknown> = { user: { id: userId } };
    if (sutraDocumentId) filters.sutra = { documentId: { $eq: sutraDocumentId } };
    if (chapterDocumentId) filters.chapter = { documentId: { $eq: chapterDocumentId } };

    const entries = await strapi.documents(UID).findMany({
      filters,
      fields: ['documentId', 'anchorKey', 'charOffset', 'excerpt', 'note', 'createdAt'],
      populate: {
        sutra: { fields: ['documentId', 'title', 'slug'] },
        volume: { fields: ['documentId', 'title', 'slug', 'volumeNumber'] },
        chapter: { fields: ['documentId', 'title', 'slug', 'chapterNumber'] },
      },
      sort: ['createdAt:desc'],
      limit: 100,
    });
    ctx.body = entries;
  },

  async createMyBookmark(ctx: any) {
    const userId = ctx.state.user?.id;
    if (!userId) return ctx.unauthorized('Yêu cầu đăng nhập');

    const {
      sutraDocumentId,
      volumeDocumentId,
      chapterDocumentId,
      anchorKey,
      charOffset,
      excerpt,
      note,
    } = (ctx.request.body ?? {}) as Record<string, unknown>;

    if (!sutraDocumentId || !chapterDocumentId) {
      return ctx.badRequest('Thiếu sutraDocumentId hoặc chapterDocumentId');
    }

    const data: Record<string, unknown> = {
      user: userId,
      sutra: { connect: [{ documentId: String(sutraDocumentId) }] },
      chapter: { connect: [{ documentId: String(chapterDocumentId) }] },
      anchorKey: anchorKey ? String(anchorKey) : null,
      charOffset: Number(charOffset ?? 0),
      excerpt: excerpt ? String(excerpt).slice(0, 800) : null,
      note: note ? String(note).slice(0, 2000) : null,
    };
    if (volumeDocumentId) {
      data.volume = { connect: [{ documentId: String(volumeDocumentId) }] };
    }

    const entry = await strapi.documents(UID).create({ data });
    ctx.body = entry;
  },

  async deleteMyBookmark(ctx: any) {
    const userId = ctx.state.user?.id;
    if (!userId) return ctx.unauthorized('Yêu cầu đăng nhập');

    const { documentId } = ctx.params as { documentId: string };
    if (!documentId) return ctx.badRequest('Thiếu documentId');

    const existing = await strapi.documents(UID).findMany({
      filters: {
        documentId: { $eq: documentId },
        user: { id: userId },
      },
      fields: ['documentId'],
      limit: 1,
    });
    if (!existing[0]) return ctx.notFound('Không tìm thấy bookmark');

    await strapi.documents(UID).delete({ documentId });
    ctx.body = { ok: true };
  },
}));

