/**
 * chant-plan controller — bao gồm aggregator getTodayChant
 *
 * GET /api/chant-plans/today-chant?date=YYYY-MM-DD&lunarMonth=N&lunarDay=N&timezone=Asia%2FBangkok
 *
 * Merge rules (Section A):
 *  eventType priority: holiday(5) > fast(4) > buddha(3) > bodhisattva(2) > teacher(1) > normal(0)
 *  disable  > tất cả (item bị ẩn)
 *  enable   → thêm nếu chưa có
 *  override_target → dùng target của override từ event priority cao nhất (không nhân multiplier)
 *  cap_max  → min(tất cả cap_max)
 *  final target = min(override_target ?? targetDefault, cap_max ?? ∞)
 *
 * Lưu ý: Mỗi sự kiện (lunar-event) xác định các item nảy cần override qua lunar-event-chant-override.
 * Không dùng multiplier chung mà dùng override_target cụ thể cho từng item để linh hoạt hơn.
 */
import { factories } from '@strapi/strapi';

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

export default factories.createCoreController('api::chant-plan.chant-plan', ({ strapi }) => ({
  async getTodayChant(ctx) {
    const { date, lunarMonth, lunarDay, timezone = 'Asia/Bangkok', planSlug = 'daily-newbie' } =
      ctx.query as Record<string, string>;

    if (!date) return ctx.badRequest('Thiếu tham số date (ISO, vd 2026-03-03)');

    const lunarM = lunarMonth ? parseInt(lunarMonth, 10) : null;
    const lunarD = lunarDay ? parseInt(lunarDay, 10) : null;

    // ── 1. Tìm các lunar_events khớp hôm nay ─────────────────
    const lunarFilters: any[] = [{ solarDate: { $eq: date } }];
    if (lunarM && lunarD) {
      lunarFilters.push({
        isRecurringLunar: { $eq: true },
        lunarMonth: { $eq: lunarM },
        lunarDay: { $eq: lunarD },
      });
    }

    const lunarEventsRes = await strapi.documents('api::lunar-event.lunar-event').findMany({
      filters: { $or: lunarFilters },
      populate: ['relatedBlogs'],
      limit: 20,
      status: 'published',
    });

    const todayEvents: any[] = lunarEventsRes ?? [];

    // ── 2. Base plan ──────────────────────────────────────────
    // Dùng 'as any' để tránh lỗi TS strict type inference của Strapi
    const planPopulate: any = {
      planItems: {
        populate: ['item']
      }
    };

    const getFirst = (res: any) => Array.isArray(res) ? res[0] : (res?.entries?.[0] ?? res?.data?.[0]);

    console.log("[today-chant] Fetching planSlug = ", planSlug);
    let planRes;
    try {
      planRes = await strapi.documents('api::chant-plan.chant-plan').findMany({
        filters: { slug: planSlug },
        populate: planPopulate,
        limit: 1,
        status: 'published',
      });
      console.log("[today-chant] planRes => ", Boolean(planRes), Object.keys(planRes || {}));
    } catch (err) {
      console.log("[today-chant] planRes ERROR =>", err);
    }

    let plan: any = getFirst(planRes) ?? null;

    // Fallback: nếu không tìm thấy plan theo slug (đặc biệt là default), lấy đại 1 cái đầu tiên
    if (!plan) {
      console.log("[today-chant] Fallback fetching any plan...");
      try {
        const allPlans = await strapi.documents('api::chant-plan.chant-plan').findMany({
          populate: planPopulate,
          limit: 1,
          status: 'published',
        });
        console.log("[today-chant] allPlans => ", Boolean(allPlans), Object.keys(allPlans || {}));
        plan = getFirst(allPlans) ?? null;
      } catch (err) {
        console.log("[today-chant] allPlans ERROR =>", err);
      }
    }

    if (!plan) {
      return ctx.notFound(`Chưa có bất kỳ plan nào được publish. Hãy tạo trong Strapi Admin.`);
    }

    const basePlanItems: any[] = (plan.planItems ?? []).sort((a: any, b: any) => a.order - b.order);

    // ── 3. Overrides ──────────────────────────────────────────
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

    // ── 5. Merge ──────────────────────────────────────────────
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
        isOptional: pi.isOptional ?? false,
        source: 'base',
        disabled: false,
        overrideTarget: null,
        capMax: null,
      });
    }

    // Sort overrides asc by priority → highest priority processes last → wins
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
            itemSlug: it.slug, itemId: it.id, itemDocumentId: it.documentId,
            title: it.title, kind: it.kind, order: nextOrder++,
            targetDefault: null, targetMin: null, targetMax: null,
            timeRules: it.timeRules ?? null, recommendedPresets: it.recommendedPresets ?? [],
            openingPrayer: it.openingPrayer ?? null,
            isOptional: true, source: 'enableOverride', disabled: false,
            overrideTarget: null, capMax: null,
          });
        }
        continue;
      }

      if (ov.mode === 'override_target' && ov.target != null) {
        const entry = itemMap.get(it.slug);
        if (entry) entry.overrideTarget = ov.target; // highest priority wins (last write)
        continue;
      }

      if (ov.mode === 'cap_max' && ov.max != null) {
        const entry = itemMap.get(it.slug);
        if (entry) entry.capMax = entry.capMax == null ? ov.max : Math.min(entry.capMax, ov.max);
        continue;
      }
    }

    // ── 6. Build final items ──────────────────────────────────
    const finalItems = [];
    for (const entry of itemMap.values()) {
      if (entry.disabled) continue;

      let target: number | null = null;
      let min = entry.targetMin;
      let max = entry.targetMax;

      if (entry.kind !== 'step') {
        if (entry.overrideTarget != null) {
          target = entry.overrideTarget;  // override_target từ lunar-event-chant-override
        } else if (entry.targetDefault != null) {
          target = entry.targetDefault;   // không nhân multiplier, dùng trực tiếp
        }
        if (entry.capMax != null) {
          if (target != null) target = Math.min(target, entry.capMax);
          max = max != null ? Math.min(max, entry.capMax) : entry.capMax;
        }
        if (min != null && max != null && min > max) min = max;
      }

      finalItems.push({
        id: entry.itemId, documentId: entry.itemDocumentId, slug: entry.itemSlug,
        title: entry.title, kind: entry.kind, order: entry.order,
        target, min, max,
        presets: entry.recommendedPresets,
        openingPrayer: entry.openingPrayer ?? null,
        timeRules: entry.timeRules,
        isOptional: entry.isOptional,
        source: entry.source,
        capsApplied: entry.capMax != null,
        capMax: entry.capMax,
      });
    }

    finalItems.sort((a, b) => a.order - b.order);

    ctx.body = {
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
  },
}));
