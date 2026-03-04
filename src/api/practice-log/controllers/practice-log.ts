/**
 * practice-log controller
 * Auth-protected: users chỉ được đọc/ghi log của chính họ
 *
 * NOTE: Type casts (as any) below are intentional — Strapi types are
 * auto-generated on first `strapi build`. Remove casts after regeneration.
 */
import { factories } from '@strapi/strapi';

const UID = 'api::practice-log.practice-log' as any;

export default factories.createCoreController(UID, ({ strapi }: any) => ({
  /**
   * GET /practice-logs/my?date=YYYY-MM-DD&planSlug=daily-newbie
   */
  async findMyLog(ctx: any) {
    const userId = ctx.state.user?.id;
    if (!userId) return ctx.unauthorized('Yêu cầu đăng nhập');

    const { date, planSlug = 'daily-newbie' } = ctx.query as Record<string, string>;
    if (!date) return ctx.badRequest('Thiếu tham số date');

    const entries = await strapi.entityService.findMany(UID, {
      filters: {
        user: { id: userId },
        date,
        planSlug,
      },
      limit: 1,
    });

    const list = Array.isArray(entries) ? entries : [entries];
    ctx.body = list[0] ?? null;
  },

  /**
   * PUT /practice-logs/my
   * Body: { date, planSlug, itemsProgress }
   */
  async upsertMyLog(ctx: any) {
    const userId = ctx.state.user?.id;
    if (!userId) return ctx.unauthorized('Yêu cầu đăng nhập');

    const { date, planSlug = 'daily-newbie', itemsProgress } = ctx.request.body as any;
    if (!date) return ctx.badRequest('Thiếu tham số date');

    const entries = await strapi.entityService.findMany(UID, {
      filters: { user: { id: userId }, date, planSlug },
      limit: 1,
    });
    const list = Array.isArray(entries) ? entries : [entries];

    // Kiểm tra xem tất cả item đã done chưa
    let completedAt: string | null = null;
    if (itemsProgress && typeof itemsProgress === 'object') {
      const allDone = Object.values(itemsProgress as Record<string, any>).every(
        (v: any) => v?.done === true
      );
      if (allDone) completedAt = new Date().toISOString();
    }

    let result;
    if (list.length > 0 && list[0]) {
      result = await strapi.entityService.update(UID, list[0].id, {
        data: { itemsProgress, completedAt },
      });
    } else {
      result = await strapi.entityService.create(UID, {
        data: { user: userId, date, planSlug, itemsProgress, completedAt },
      });
    }

    ctx.body = result;
  },
}));

