/**
 * push-subscription controller (Strapi v5)
 *
 * Custom handler:
 *  POST /api/push-subscriptions/upsert — tạo mới hoặc cập nhật reminderHour nếu endpoint đã tồn tại
 *
 * Các route chuẩn (find, findOne, delete) giữ nguyên từ core router.
 * Tất cả routes đều yêu cầu API Token (không public).
 */
import { factories } from '@strapi/strapi';
import { createLogger } from '../../../utils/logger';

const UID = 'api::push-subscription.push-subscription' as any;

export default factories.createCoreController(UID, ({ strapi }) => ({
  /**
   * POST /api/push-subscriptions/upsert
   * Body: { endpoint, p256dh, auth, reminderHour }
   */
  async upsert(ctx) {
    const log = createLogger(strapi, 'push-subscription');
    const { endpoint, p256dh, auth, reminderHour } = ctx.request.body as Record<string, unknown>;

    if (
      !endpoint || typeof endpoint !== 'string' ||
      !p256dh || typeof p256dh !== 'string' ||
      !auth || typeof auth !== 'string'
    ) {
      return ctx.badRequest('Thiếu trường bắt buộc: endpoint, p256dh, auth');
    }

    const hour = typeof reminderHour === 'number' ? reminderHour : 6;

    try {
      const existing = await (strapi.db as any)
        .query(UID)
        .findOne({ where: { endpoint } });

      if (existing) {
        await (strapi.documents as any)(UID).update({
          documentId: existing.documentId,
          data: { endpoint, p256dh, auth, reminderHour: hour },
        });
        ctx.body = { action: 'updated' };
      } else {
        await (strapi.documents as any)(UID).create({
          data: { endpoint, p256dh, auth, reminderHour: hour },
        });
        ctx.body = { action: 'created' };
      }
    } catch (err) {
      log.error('upsert failed', err);
      ctx.status = 500;
      ctx.body = { error: 'Lỗi server khi lưu subscription' };
    }
  },

  /**
   * DELETE /api/push-subscriptions/by-endpoint
   * Body: { endpoint }
   */
  async deleteByEndpoint(ctx) {
    const log = createLogger(strapi, 'push-subscription');
    const { endpoint } = ctx.request.body as Record<string, unknown>;

    if (!endpoint || typeof endpoint !== 'string') {
      return ctx.badRequest('Thiếu endpoint');
    }

    try {
      const existing = await (strapi.db as any)
        .query(UID)
        .findOne({ where: { endpoint } });

      if (existing) {
        await (strapi.documents as any)(UID).delete({ documentId: existing.documentId });
      }
      ctx.body = { success: true };
    } catch (err) {
      log.error('deleteByEndpoint failed', err);
      ctx.status = 500;
      ctx.body = { error: 'Lỗi server' };
    }
  },
}));
