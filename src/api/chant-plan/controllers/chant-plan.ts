import { factories } from '@strapi/strapi';
import { createLogger } from '../../../utils/logger';
import { applyUserChantConfig } from '../utils/today-chant';

const EVENT_PRIORITY: Record<string, number> = {
  holiday: 5,
  fast: 4,
  buddha: 3,
  bodhisattva: 2,
  teacher: 1,
  normal: 0,
};

function getEventPriority(event: any, overridePriority?: number | null): number {
  if (overridePriority != null) return overridePriority;
  return EVENT_PRIORITY[event?.eventType ?? 'normal'] ?? 0;
}

async function findPlanBySlug(strapi: any, planSlug?: string | null) {
  const planPopulate: any = {
    planItems: {
      populate: {
        item: {
          populate: ['audio', 'scriptFile', 'scriptPreviewImages'],
        },
      },
    },
  };

  const getFirst = (res: any) => Array.isArray(res) ? res[0] : (res?.entries?.[0] ?? res?.data?.[0]);

  let plan: any = null;
  if (planSlug) {
    const planRes = await strapi.documents('api::chant-plan.chant-plan').findMany({
      filters: { slug: planSlug },
      populate: planPopulate,
      limit: 1,
      status: 'published',
    });
    plan = getFirst(planRes) ?? null;
  }

  if (!plan) {
    const allPlans = await strapi.documents('api::chant-plan.chant-plan').findMany({
      populate: planPopulate,
      limit: 50,
      status: 'published',
    });
    plan = (Array.isArray(allPlans) ? allPlans : []).find(
      (entry: any) => Array.isArray(entry?.planItems) && entry.planItems.length > 0
    ) ?? getFirst(allPlans) ?? null;
  }

  return plan;
}

async function buildTodayChantPayload(strapi: any, options: {
  date: string;
  lunarMonth?: string | null;
  lunarDay?: string | null;
  planSlug?: string | null;
}) {
  const { date, lunarMonth, lunarDay, planSlug } = options;
  const lunarM = lunarMonth ? parseInt(lunarMonth, 10) : null;
  const lunarD = lunarDay ? parseInt(lunarDay, 10) : null;

  const lunarFilters: any[] = [{ solarDate: { $eq: date } }];
  if (lunarM && lunarD) {
    lunarFilters.push({
      isRecurringLunar: { $eq: true },
      lunarMonth: { $eq: lunarM },
      lunarDay: { $eq: lunarD },
    });
  }

  const todayEvents: any[] = await strapi.documents('api::lunar-event.lunar-event').findMany({
    filters: { $or: lunarFilters },
    populate: ['relatedBlogs'],
    limit: 20,
    status: 'published',
  }) ?? [];

  const plan = await findPlanBySlug(strapi, planSlug);
  if (!plan) {
    return null;
  }

  const basePlanItems: any[] = (plan.planItems ?? []).sort((a: any, b: any) => a.order - b.order);
  const todayEventDocumentIds = todayEvents.map((e: any) => e.documentId).filter(Boolean);

  let overrides: any[] = [];
  if (todayEventDocumentIds.length > 0) {
    overrides = await strapi.documents('api::lunar-event-chant-override.lunar-event-chant-override').findMany({
      filters: {
        lunarEvent: { documentId: { $in: todayEventDocumentIds } },
      },
      populate: ['item', 'lunarEvent'],
      limit: 100,
      status: 'published',
    });
  }

  type MergedItem = {
    itemSlug: string;
    itemId: number;
    itemDocumentId: string;
    title: string;
    kind: string;
    order: number;
    targetDefault: number | null;
    targetMin: number | null;
    targetMax: number | null;
    timeRules: any;
    recommendedPresets: number[];
    openingPrayer: string | null;
    content: string | null;
    scriptFile: any;
    scriptPreviewImages: any[];
    isOptional: boolean;
    source: 'base' | 'enableOverride';
    disabled: boolean;
    overrideTarget: number | null;
    capMax: number | null;
  };

  const itemMap = new Map<string, MergedItem>();
  for (const pi of basePlanItems) {
    const it = pi.item;
    if (!it) continue;
    itemMap.set(it.slug, {
      itemSlug: it.slug,
      itemId: it.id,
      itemDocumentId: it.documentId,
      title: it.title,
      kind: it.kind,
      order: pi.order,
      targetDefault: pi.targetDefault ?? null,
      targetMin: pi.targetMin ?? null,
      targetMax: pi.targetMax ?? null,
      timeRules: it.timeRules ?? null,
      recommendedPresets: it.recommendedPresets ?? [],
      openingPrayer: it.openingPrayer ?? null,
      content: it.content ?? null,
      scriptFile: it.scriptFile ?? null,
      scriptPreviewImages: it.scriptPreviewImages ?? [],
      isOptional: pi.isOptional ?? false,
      source: 'base',
      disabled: false,
      overrideTarget: null,
      capMax: null,
    });
  }

  const sortedOverrides = [...overrides].sort(
    (a, b) =>
      getEventPriority(a.lunarEvent, a.priority) - getEventPriority(b.lunarEvent, b.priority)
  );

  let nextOrder = basePlanItems.length * 10;
  for (const ov of sortedOverrides) {
    const it = ov.item;
    if (!it) continue;

    if (ov.mode === 'disable') {
      if (itemMap.has(it.slug)) itemMap.get(it.slug)!.disabled = true;
      continue;
    }

    if (ov.mode === 'enable') {
      if (!itemMap.has(it.slug)) {
        itemMap.set(it.slug, {
          itemSlug: it.slug,
          itemId: it.id,
          itemDocumentId: it.documentId,
          title: it.title,
          kind: it.kind,
          order: nextOrder++,
          targetDefault: null,
          targetMin: null,
          targetMax: null,
          timeRules: it.timeRules ?? null,
          recommendedPresets: it.recommendedPresets ?? [],
          openingPrayer: it.openingPrayer ?? null,
          content: it.content ?? null,
          scriptFile: it.scriptFile ?? null,
          scriptPreviewImages: it.scriptPreviewImages ?? [],
          isOptional: true,
          source: 'enableOverride',
          disabled: false,
          overrideTarget: null,
          capMax: null,
        });
      }
      continue;
    }

    if (ov.mode === 'override_target' && ov.target != null) {
      const entry = itemMap.get(it.slug);
      if (entry) entry.overrideTarget = ov.target;
      continue;
    }

    if (ov.mode === 'cap_max' && ov.max != null) {
      const entry = itemMap.get(it.slug);
      if (entry) entry.capMax = entry.capMax == null ? ov.max : Math.min(entry.capMax, ov.max);
    }
  }

  const finalItems = [];
  for (const entry of itemMap.values()) {
    if (entry.disabled) continue;

    let target: number | null = null;
    let min = entry.targetMin;
    let max = entry.targetMax;

    if (entry.kind !== 'step') {
      if (entry.overrideTarget != null) {
        target = entry.overrideTarget;
      } else if (entry.targetDefault != null) {
        target = entry.targetDefault;
      }
      if (entry.capMax != null) {
        if (target != null) target = Math.min(target, entry.capMax);
        max = max != null ? Math.min(max, entry.capMax) : entry.capMax;
      }
      if (min != null && max != null && min > max) min = max;
    }

    finalItems.push({
      id: entry.itemId,
      documentId: entry.itemDocumentId,
      slug: entry.itemSlug,
      title: entry.title,
      kind: entry.kind,
      order: entry.order,
      target,
      min,
      max,
      presets: entry.recommendedPresets,
      openingPrayer: entry.openingPrayer,
      content: entry.content,
      scriptFile: entry.scriptFile,
      scriptPreviewImages: entry.scriptPreviewImages,
      timeRules: entry.timeRules,
      isOptional: entry.isOptional,
      source: entry.source,
      capsApplied: entry.capMax != null,
      capMax: entry.capMax,
    });
  }

  finalItems.sort((a, b) => a.order - b.order);

  return {
    date,
    lunarInfo: lunarM && lunarD ? { month: lunarM, day: lunarD } : null,
    todayEvents: todayEvents.map((e: any) => ({
      id: e.id,
      documentId: e.documentId,
      title: e.title,
      eventType: e.eventType,
      relatedBlogs: (e.relatedBlogs ?? []).map((b: any) => ({
        id: b.id ?? 0,
        title: b.title ?? '',
        slug: b.slug ?? '',
      })),
    })),
    planSlug: plan.slug,
    items: finalItems,
  };
}

export default factories.createCoreController('api::chant-plan.chant-plan', ({ strapi }) => ({
  async getTodayChant(ctx) {
    const log = createLogger(strapi, 'today-chant');
    const { date, lunarMonth, lunarDay, timezone = 'Asia/Bangkok', planSlug } =
      ctx.query as Record<string, string>;

    if (!date) return ctx.badRequest('Thiếu tham số date (ISO, vd 2026-03-03)');
    try {
      const payload = await buildTodayChantPayload(strapi, { date, lunarMonth, lunarDay, planSlug });
      if (!payload) {
        return ctx.notFound('Chưa có bất kỳ plan nào được publish. Hãy tạo trong Strapi Admin.');
      }
      ctx.body = payload;
    } catch (err) {
      log.error('fetchPlan failed', err);
      ctx.throw(500, err instanceof Error ? err.message : 'Lỗi hệ thống khi tạo công khóa hôm nay');
    }
  },

  async getTodayChantMy(ctx) {
    const userId = ctx.state.user?.id;
    if (!userId) return ctx.unauthorized('Yêu cầu đăng nhập');

    const { date, lunarMonth, lunarDay, planSlug } = ctx.query as Record<string, string>;
    if (!date) return ctx.badRequest('Thiếu tham số date (ISO, vd 2026-03-03)');

    const payload = await buildTodayChantPayload(strapi, { date, lunarMonth, lunarDay, planSlug });
    if (!payload) {
      return ctx.notFound('Chưa có bất kỳ plan nào được publish. Hãy tạo trong Strapi Admin.');
    }

    const plan = await findPlanBySlug(strapi, payload.planSlug);
    let templateConfig = {};
    let sessionConfig = {};

    if (plan) {
      const preferenceEntries = await strapi.documents('api::chant-preference.chant-preference').findMany({
        filters: {
          user: { id: userId },
          plan: { documentId: { $eq: plan.documentId } },
        },
        limit: 1,
      });
      templateConfig = preferenceEntries[0]?.templateConfig ?? {};

      const practiceEntries = await strapi.documents('api::practice-log.practice-log').findMany({
        filters: {
          user: { id: userId },
          date: { $eq: date },
          plan: { documentId: { $eq: plan.documentId } },
        },
        limit: 1,
      });
      sessionConfig = practiceEntries[0]?.sessionConfig ?? {};
    }

    ctx.body = {
      ...payload,
      items: applyUserChantConfig(payload.items, templateConfig, sessionConfig),
      templateConfig,
      sessionConfig,
    };
  },
}));
