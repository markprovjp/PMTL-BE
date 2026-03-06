/**
 * practice-log controller
 * Auth-protected: users chi duoc doc/ghi log cua chinh ho
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
    try {
      const userId = ctx.state.user?.id;
      if (!userId) return ctx.unauthorized('Yeu cau dang nhap');

      const { date, planSlug = 'daily-newbie' } = ctx.query as Record<string, string>;
      if (!date) return ctx.badRequest('Thieu tham so date');

      strapi.log.debug(`[PracticeLog] Finding log for user ${userId}, date ${date}, plan ${planSlug}`);

      const entry = await strapi.db.query(UID).findOne({
        where: {
          user: userId,
          date: date,
          planSlug: planSlug,
        },
      });

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
      if (!userId) return ctx.unauthorized('Yeu cau dang nhap');

      const { date, planSlug = 'daily-newbie', itemsProgress } = ctx.request.body as any;
      if (!date) return ctx.badRequest('Thieu tham so date');

      const existing = await strapi.db.query(UID).findOne({
        where: { user: userId, date, planSlug },
      });

      // Kiem tra xem tat ca item da done chua
      let completedAt: string | null = null;
      if (itemsProgress && typeof itemsProgress === 'object') {
        const values = Object.values(itemsProgress as Record<string, any>);
        if (values.length > 0) {
          const allDone = values.every((v: any) => v?.done === true);
          if (allDone) completedAt = new Date().toISOString();
        }
      }

      let result;
      if (existing) {
        // Dung Document Service de update boi vi no ho tro cac lifecycle v5 tot hon
        result = await strapi.documents(UID).update({
          documentId: existing.documentId,
          data: {
            itemsProgress,
            completedAt
          },
        });
      } else {
        result = await strapi.documents(UID).create({
          data: {
            user: userId,
            date,
            planSlug,
            itemsProgress,
            completedAt
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

