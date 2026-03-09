/**
 * guestbook-entry controller (Strapi v5)
 *
 * Custom handlers:
 *  POST /guestbook-entries/submit          — gửi lưu bút hiển thị ngay
 *  GET  /guestbook-entries/list            — lấy danh sách đã hiển thị
 *  GET  /guestbook-entries/archive/:year/:month — lấy theo tháng/năm
 */
import { factories } from '@strapi/strapi';
import { createHash } from 'node:crypto';
import { createLogger } from '../../../utils/logger';
import { formatWaitTime, RATE_LIMITS } from '../../../utils/rate-limit';

const GB_UID = 'api::guestbook-entry.guestbook-entry';

const submitCooldown = new Map<string, number>();
const COOLDOWN_MS = RATE_LIMITS.guestbookSubmitMs;

function checkCooldown(ipHash: string): boolean {
  const last = submitCooldown.get(ipHash);
  if (!last) return false;
  return Date.now() - last < COOLDOWN_MS;
}

function recordCooldown(ipHash: string): void {
  submitCooldown.set(ipHash, Date.now());
  if (submitCooldown.size > 5000) {
    const cutoff = Date.now() - COOLDOWN_MS * 10;
    for (const [k, v] of submitCooldown.entries()) {
      if (v < cutoff) submitCooldown.delete(k);
    }
  }
}

function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim();
}

export default factories.createCoreController(GB_UID, ({ strapi }) => ({
  /**
   * POST /api/guestbook-entries/submit
   */
  async submit(ctx) {
    const log = createLogger(strapi, 'guestbook-entry');
    const rawIp: string =
      (ctx.request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      ctx.request.ip ??
      'unknown';
    const ipHash = hashIp(rawIp);

    if (checkCooldown(ipHash)) {
      ctx.status = 429;
      ctx.body = { error: `Bạn gửi lưu bút quá nhanh. Vui lòng thử lại sau ${formatWaitTime(COOLDOWN_MS)}.` };
      return;
    }

    const body = ctx.request.body as Record<string, unknown>;
    const { authorName, country, message, entryType, questionCategory } = body;

    if (!authorName || typeof authorName !== 'string' || authorName.trim().length < 1) {
      return ctx.badRequest('Thiếu tên tác giả.');
    }
    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return ctx.badRequest('Lưu bút quá ngắn (tối thiểu 5 ký tự).');
    }

    try {
      const entity = await (strapi.documents as any)(GB_UID).create({
        data: {
          authorName: stripHtml(String(authorName)).slice(0, 100),
          country: country ? stripHtml(String(country)).slice(0, 100) : undefined,
          message: stripHtml(String(message)).slice(0, 2000),
          entryType: entryType || 'message',
          questionCategory: questionCategory ? stripHtml(String(questionCategory)).slice(0, 100) : undefined,
          approvalStatus: 'approved',
          isAnswered: false,
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
        },
      });
      recordCooldown(ipHash);

      ctx.status = 201;
      ctx.body = {
        data: { documentId: entity.documentId },
        message: 'Lưu bút đã được ghi lại.',
      };
    } catch (err) {
      log.error('submit failed', err);
      ctx.status = 500;
      ctx.body = { error: 'Lỗi server khi gửi lưu bút.' };
    }
  },

  /**
   * GET /api/guestbook-entries/list?page=1&pageSize=20
   */
  async list(ctx) {
    const log = createLogger(strapi, 'guestbook-entry');
    const page = Math.max(1, parseInt(String(ctx.query['page'] ?? '1'), 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(String(ctx.query['pageSize'] ?? '20'), 10)));

    try {
      const [entries, total] = await Promise.all([
        (strapi.documents as any)(GB_UID).findMany({
          filters: { approvalStatus: { $eq: 'approved' } },
          sort: ['createdAt:desc'],
          start: (page - 1) * pageSize,
          limit: pageSize,
          fields: ['documentId', 'authorName', 'country', 'message', 'adminReply', 'isOfficialReply', 'badge', 'entryType', 'questionCategory', 'isAnswered', 'createdAt'],
          populate: { avatar: { fields: ['url', 'formats', 'width', 'height', 'alternativeText'] } },
        }),
        (strapi.documents as any)(GB_UID).count({
          filters: { approvalStatus: { $eq: 'approved' } }
        }),
      ]);

      ctx.body = {
        data: entries,
        meta: {
          pagination: {
            page,
            pageSize,
            pageCount: Math.ceil(total / pageSize),
            total,
          },
        },
      };
    } catch (err) {
      log.error('list failed', err);
      ctx.status = 500;
      ctx.body = { error: 'Lỗi server.' };
    }
  },

  /**
   * GET /api/guestbook-entries/archive/:year/:month?page=1&pageSize=20
   */
  async archive(ctx) {
    const log = createLogger(strapi, 'guestbook-entry');
    const { year, month } = ctx.params as { year: string; month: string };
    const page = Math.max(1, parseInt(String(ctx.query['page'] ?? '1'), 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(String(ctx.query['pageSize'] ?? '20'), 10)));

    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    if (isNaN(y) || isNaN(m) || m < 1 || m > 12) {
      return ctx.badRequest('Năm hoặc tháng không hợp lệ.');
    }

    const dateFrom = new Date(y, m - 1, 1).toISOString();
    const dateTo = new Date(y, m, 1).toISOString();

    try {
      const [entries, total] = await Promise.all([
        (strapi.documents as any)(GB_UID).findMany({
          filters: {
            approvalStatus: { $eq: 'approved' },
            createdAt: { $gte: dateFrom, $lt: dateTo },
          },
          sort: ['createdAt:desc'],
          start: (page - 1) * pageSize,
          limit: pageSize,
          fields: ['documentId', 'authorName', 'country', 'message', 'adminReply', 'isOfficialReply', 'badge', 'entryType', 'questionCategory', 'isAnswered', 'createdAt'],
          populate: { avatar: { fields: ['url', 'formats', 'width', 'height', 'alternativeText'] } },
        }),
        (strapi.documents as any)(GB_UID).count({
          filters: {
            approvalStatus: { $eq: 'approved' },
            createdAt: { $gte: dateFrom, $lt: dateTo },
          },
        }),
      ]);

      ctx.body = {
        data: entries,
        meta: {
          pagination: {
            page,
            pageSize,
            pageCount: Math.ceil(total / pageSize),
            total,
          },
          archive: { year: y, month: m },
        },
      };
    } catch (err) {
      log.error('archive failed', err);
      ctx.status = 500;
      ctx.body = { error: 'Lỗi server.' };
    }
  },

  /**
   * GET /api/guestbook-entries/archive-list
   * Thống kê số lượng lưu bút theo Năm/Tháng
   */
  async archiveList(ctx) {
    const log = createLogger(strapi, 'guestbook-entry');
    try {
      const items = await (strapi.documents as any)(GB_UID).findMany({
        filters: { approvalStatus: { $eq: 'approved' } },
        fields: ['createdAt'],
        limit: 100000,
        start: 0
      });

      const map = new Map<string, number>();
      for (const item of items) {
        if (!item.createdAt) continue;
        const d = new Date(item.createdAt);
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        const key = `${y}-${m}`;
        map.set(key, (map.get(key) || 0) + 1);
      }

      const mapped = Array.from(map.entries()).map(([k, count]) => {
        const [y, m] = k.split('-');
        return {
          year: parseInt(y, 10),
          month: parseInt(m, 10),
          count: count as number
        };
      }).sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });

      ctx.body = { data: mapped };
    } catch (err) {
      log.error('archiveList failed', err);
      ctx.status = 500;
      ctx.body = { error: 'Lỗi server.' };
    }
  },
}));
