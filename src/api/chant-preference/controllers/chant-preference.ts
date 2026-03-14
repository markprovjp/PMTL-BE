import { factories } from '@strapi/strapi';

const UID = 'api::chant-preference.chant-preference' as const;
const PLAN_UID = 'api::chant-plan.chant-plan' as const;

async function findPlanBySlug(strapi: any, planSlug?: string | null) {
  if (planSlug) {
    const plans = await strapi.documents(PLAN_UID).findMany({
      filters: { slug: { $eq: planSlug } },
      fields: ['id', 'documentId', 'slug'],
      limit: 1,
      status: 'published',
    });
    if (plans[0]) return plans[0];
  }

  const plans = await strapi.documents(PLAN_UID).findMany({
    fields: ['id', 'documentId', 'slug'],
    populate: {
      planItems: {
        fields: ['id'],
      },
    } as any,
    limit: 50,
    status: 'published',
  });

  return (plans as any[]).find((plan) => Array.isArray(plan?.planItems) && plan.planItems.length > 0) ?? plans[0] ?? null;
}

export default factories.createCoreController(UID, ({ strapi }: any) => ({
  async findMyPreference(ctx: any) {
    const userId = ctx.state.user?.id;
    if (!userId) return ctx.unauthorized('Yêu cầu đăng nhập');

    const plan = await findPlanBySlug(strapi, ctx.query?.planSlug as string | null | undefined);
    if (!plan) {
      ctx.body = null;
      return;
    }

    const entries = await strapi.documents(UID).findMany({
      filters: {
        user: { id: userId },
        plan: { documentId: { $eq: plan.documentId } },
      },
      populate: ['plan'],
      limit: 1,
    });

    ctx.body = entries[0] ?? null;
  },

  async upsertMyPreference(ctx: any) {
    const userId = ctx.state.user?.id;
    if (!userId) return ctx.unauthorized('Yêu cầu đăng nhập');

    const { planSlug, templateConfig } = ctx.request.body as {
      planSlug?: string | null;
      templateConfig?: Record<string, unknown> | null;
    };

    const plan = await findPlanBySlug(strapi, planSlug);
    if (!plan) return ctx.badRequest('Không tìm thấy plan để lưu cấu hình');

    const entries = await strapi.documents(UID).findMany({
      filters: {
        user: { id: userId },
        plan: { documentId: { $eq: plan.documentId } },
      },
      fields: ['documentId'],
      limit: 1,
    });

    const existing = entries[0] ?? null;

    const payload = {
      user: userId,
      plan: { connect: [{ documentId: plan.documentId }] },
      templateConfig: templateConfig ?? {},
    };

    const result = existing
      ? await strapi.documents(UID).update({
          documentId: existing.documentId,
          data: { templateConfig: templateConfig ?? {} },
        })
      : await strapi.documents(UID).create({
          data: payload,
        });

    ctx.body = result;
  },
}));
