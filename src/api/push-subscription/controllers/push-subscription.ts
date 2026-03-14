/**
 * push-subscription controller (Strapi v5)
 *
 * Custom handler:
 *  POST /api/push-subscriptions/upsert — tạo mới hoặc cập nhật subscription theo endpoint
 *
 * Các route chuẩn (find, findOne, delete) giữ nguyên từ core router.
 * Tất cả routes đều yêu cầu API Token (không public).
 */
import { factories } from '@strapi/strapi';
import { createLogger } from '../../../utils/logger';

const UID = 'api::push-subscription.push-subscription' as any;
const PUSH_TYPES = ['daily_chant', 'content_update', 'event_reminder', 'community'] as const;

function normalizeTypes(value: unknown): string[] {
  if (!Array.isArray(value)) return ['community'];

  const unique = Array.from(new Set(
    value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter((item) => PUSH_TYPES.includes(item as (typeof PUSH_TYPES)[number]))
  ));

  return unique.length > 0 ? unique : ['community'];
}

function normalizeHour(value: unknown, fallback: number): number {
  const hour = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(hour)) return fallback;
  return Math.min(23, Math.max(0, Math.round(hour)));
}

function normalizeMinute(value: unknown, fallback: number): number {
  const minute = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(minute)) return fallback;
  return Math.min(59, Math.max(0, Math.round(minute)));
}

export default factories.createCoreController(UID, ({ strapi }) => ({
  /**
   * POST /api/push-subscriptions/upsert
   * Body: { endpoint, p256dh, auth, notificationTypes }
   */
  async upsert(ctx) {
    const log = createLogger(strapi, 'push-subscription');
    const {
      endpoint,
      p256dh,
      auth,
      reminderHour,
      reminderMinute,
      userId,
      timezone,
      notificationTypes,
      quietHoursStart,
      quietHoursEnd,
      isActive,
    } = ctx.request.body as Record<string, unknown>;

    if (
      !endpoint || typeof endpoint !== 'string' ||
      !p256dh || typeof p256dh !== 'string' ||
      !auth || typeof auth !== 'string'
    ) {
      return ctx.badRequest('Thiếu trường bắt buộc: endpoint, p256dh, auth');
    }

    const hour = normalizeHour(reminderHour, 6);
    const minute = normalizeMinute(reminderMinute, 0);
    const quietStart = normalizeHour(quietHoursStart, 22);
    const quietEnd = normalizeHour(quietHoursEnd, 6);
    const types = normalizeTypes(notificationTypes);
    const cleanTimezone = typeof timezone === 'string' && timezone.trim()
      ? timezone.trim().slice(0, 100)
      : 'Asia/Ho_Chi_Minh';
    const nextData = {
      endpoint,
      p256dh,
      auth,
      reminderHour: hour,
      reminderMinute: minute,
      timezone: cleanTimezone,
      isActive: typeof isActive === 'boolean' ? isActive : true,
      notificationTypes: types,
      quietHoursStart: quietStart,
      quietHoursEnd: quietEnd,
      ...(typeof userId === 'number' && userId > 0 ? { user: userId } : {}),
    };

    try {
      const existing = await (strapi.db as any)
        .query(UID)
        .findOne({ where: { endpoint } });

      if (existing) {
        await (strapi.documents as any)(UID).update({
          documentId: existing.documentId,
          data: nextData,
        });
        ctx.body = { action: 'updated' };
      } else {
        await (strapi.documents as any)(UID).create({
          data: nextData,
        });
        ctx.body = { action: 'created' };
      }
    } catch (err) {
      log.error('upsert failed', err);
      ctx.status = 500;
      ctx.body = { error: 'Lỗi server khi lưu subscription' };
    }
  },

  async stats(ctx) {
    const log = createLogger(strapi, 'push-subscription');

    try {
      const entries: any[] = [];
      const pageSize = 500;
      let start = 0;

      while (true) {
        const batch = await (strapi.documents as any)(UID).findMany({
          start,
          limit: pageSize,
          fields: ['documentId', 'timezone', 'isActive', 'failedCount', 'updatedAt', 'notificationTypes'],
        });

        entries.push(...batch);

        if (!Array.isArray(batch) || batch.length < pageSize) {
          break;
        }

        start += pageSize;
      }

      const active = entries.filter((item: any) => item.isActive !== false).length;
      const inactive = entries.length - active;
      const failing = entries.filter((item: any) => (item.failedCount ?? 0) > 0).length;

      const byTimezoneMap = new Map<string, number>();
      const byTypeMap = new Map<string, number>();
      for (const item of entries) {
        if (item.isActive === false) continue;
        const tz = item.timezone || 'Asia/Ho_Chi_Minh';
        byTimezoneMap.set(tz, (byTimezoneMap.get(tz) ?? 0) + 1);
        const types = Array.isArray(item.notificationTypes) ? item.notificationTypes : [];
        for (const type of types) {
          byTypeMap.set(type, (byTypeMap.get(type) ?? 0) + 1);
        }
      }

      ctx.body = {
        data: {
          total: entries.length,
          active,
          inactive,
          failing,
          byType: Array.from(byTypeMap.entries()).map(([type, total]) => ({ type, total })),
          byTimezone: Array.from(byTimezoneMap.entries()).map(([timezone, total]) => ({ timezone, total })),
        },
      };
    } catch (err) {
      log.error('stats failed', err);
      ctx.status = 500;
      ctx.body = { error: 'Không thể lấy thống kê push lúc này.' };
    }
  },

  async update(ctx) {
    const log = createLogger(strapi, 'push-subscription');
    const documentId = String(ctx.params?.documentId ?? '');
    const payload = (ctx.request.body as Record<string, unknown> | undefined)?.data;

    if (!documentId) {
      return ctx.badRequest('Thiếu documentId');
    }

    if (!payload || typeof payload !== 'object') {
      return ctx.badRequest('Thiếu dữ liệu cập nhật');
    }

    try {
      const existing = await (strapi.db as any).query(UID).findOne({
        where: { documentId },
      });

      if (!existing?.documentId) {
        return ctx.notFound('Không tìm thấy subscription');
      }

      const updated = await (strapi.documents as any)(UID).update({
        documentId: existing.documentId,
        data: payload,
      });

      ctx.body = { data: updated, meta: {} };
    } catch (err) {
      log.error('update failed', err);
      ctx.status = 500;
      ctx.body = { error: 'Không thể cập nhật subscription lúc này.' };
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
