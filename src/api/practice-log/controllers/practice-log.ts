/**
 * practice-log controller
 * Auth-protected: users chỉ được đọc/ghi log của chính họ
 *
 * Sau khi xóa planSlug field khỏi schema, dùng `plan` relation để track.
 * Query tìm log dựa vào user + date + plan.documentId thay vì planSlug string.
 */
import { factories } from '@strapi/strapi';

const UID = 'api::practice-log.practice-log' as any;
const PLAN_UID = 'api::chant-plan.chant-plan' as any;

/** Tìm documentId của chant-plan theo slug - dùng Document Service API */
async function findPlanBySlug(strapi: any, planSlug: string): Promise<{ id: number; documentId: string } | null> {
  const results = await strapi.documents(PLAN_UID).findMany({
    filters: { slug: { $eq: planSlug } },
    fields: ['id', 'documentId'],
    limit: 1,
  });
  return results[0] ?? null;
}

export default factories.createCoreController(UID, ({ strapi }: any) => ({
  /**
   * GET /practice-logs/my?date=YYYY-MM-DD&planSlug=daily-newbie
   */
  async findMyLog(ctx: any) {
    try {
      const userId = ctx.state.user?.id;
      if (!userId) return ctx.unauthorized('Yêu cầu đăng nhập');

      const { date, planSlug = 'daily-newbie' } = ctx.query as Record<string, string>;
      if (!date) return ctx.badRequest('Thiếu tham số date');

      const plan = await findPlanBySlug(strapi, planSlug);

      const entries = await strapi.documents(UID).findMany({
        filters: {
          user: { id: userId },
          date: { $eq: date },
          ...(plan ? { plan: { documentId: { $eq: plan.documentId } } } : {}),
        },
        populate: ['plan'],
        limit: 1,
      });
      const entry = entries[0] ?? null;

      ctx.body = entry ?? null;
    } catch (err) {
      strapi.log.error('[PracticeLog findMyLog] Error:', err);
      ctx.throw(500, err instanceof Error ? err.message : 'Lỗi hệ thống khi đọc nhật ký');
    }
  },

  /**
   * PUT /practice-logs/my
   * Body: { date, planSlug, itemsProgress }
   */
  async upsertMyLog(ctx: any) {
    try {
      const userId = ctx.state.user?.id;
      if (!userId) return ctx.unauthorized('Yêu cầu đăng nhập');

      const { date, planSlug = 'daily-newbie', itemsProgress } = ctx.request.body as any;
      if (!date) return ctx.badRequest('Thiếu tham số date');

      // Tìm plan theo slug để lấy documentId cho relation
      const plan = await findPlanBySlug(strapi, planSlug);

      const existingEntries = await strapi.documents(UID).findMany({
        filters: {
          user: { id: userId },
          date: { $eq: date },
          ...(plan ? { plan: { documentId: { $eq: plan.documentId } } } : {}),
        },
        fields: ['id', 'documentId'],
        limit: 1,
      });
      const existing = existingEntries[0] ?? null;

      // Kiểm tra xem tất cả item đã done chưa
      let completedAt: string | null = null;
      let isCompleted = false;
      if (itemsProgress && typeof itemsProgress === 'object') {
        const values = Object.values(itemsProgress as Record<string, any>);
        if (values.length > 0) {
          const allDone = values.every((v: any) => v?.done === true);
          if (allDone) {
            isCompleted = true;
            completedAt = new Date().toISOString();
          }
        }
      }

      let result;
      if (existing) {
        result = await strapi.documents(UID).update({
          documentId: existing.documentId,
          data: {
            itemsProgress,
            completedAt,
            isCompleted,
          },
        });
      } else {
        result = await strapi.documents(UID).create({
          data: {
            user: userId,
            ...(plan ? { plan: { connect: [{ documentId: plan.documentId }] } } : {}),
            date,
            itemsProgress,
            startedAt: new Date().toISOString(),
            completedAt,
            isCompleted,
          },
        });
      }

      ctx.body = result;
    } catch (err) {
      strapi.log.error('[PracticeLog upsertMyLog] Error:', err);
      ctx.throw(500, err instanceof Error ? err.message : 'Lỗi hệ thống khi lưu nhật ký');
    }
  },
}));
