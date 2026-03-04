/**
 * lunar-event controller
 * Bao gom action findWithBlogs de tra ve relatedBlogs qua Document Service,
 * tranh han che permission cua REST API public endpoint
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::lunar-event.lunar-event', ({ strapi }) => ({
  /**
   * GET /api/lunar-events/with-blogs
   * Tra ve tat ca lunar-events da publish, voi relatedBlogs duoc populate day du.
   * Dung Document Service thay vi REST API de lay duoc relatedBlogs du lieu that.
   */
  async findWithBlogs(ctx) {
    const events = await strapi.documents('api::lunar-event.lunar-event').findMany({
      populate: {
        relatedBlogs: {
          fields: ['id', 'documentId', 'title', 'slug'],
        },
      },
      limit: 100,
      status: 'published',
    });

    ctx.body = {
      data: (events ?? []).map((e: any) => ({
        id: e.id,
        documentId: e.documentId,
        title: e.title,
        isRecurringLunar: e.isRecurringLunar ?? false,
        lunarMonth: e.lunarMonth ?? null,
        lunarDay: e.lunarDay ?? null,
        solarDate: e.solarDate ?? null,
        eventType: e.eventType ?? 'normal',
        relatedBlogs: (e.relatedBlogs ?? []).map((b: any) => ({
          id: b.id,
          documentId: b.documentId,
          title: b.title ?? '',
          slug: b.slug ?? '',
        })),
      })),
    };
  },
}));

