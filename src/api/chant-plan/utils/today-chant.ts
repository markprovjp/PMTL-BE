type IntentionsBySlug = Record<
  string,
  {
    selfName?: string;
    counterpartName?: string;
    wish?: string;
  }
>;

export interface ChantSessionConfig {
  enabledOptionalSlugs?: string[];
  targetsBySlug?: Record<string, number>;
  intentionsBySlug?: IntentionsBySlug;
}

export interface TodayChantLikeItem {
  slug: string;
  kind: string;
  isOptional: boolean;
  target: number | null;
  min: number | null;
  max: number | null;
  openingPrayer?: string | null;
  [key: string]: unknown;
}

export function normalizeChantConfig(config: unknown): ChantSessionConfig {
  if (!config || typeof config !== 'object') return {};

  const raw = config as Record<string, unknown>;
  const targetsBySlug = raw.targetsBySlug && typeof raw.targetsBySlug === 'object'
    ? Object.fromEntries(
        Object.entries(raw.targetsBySlug as Record<string, unknown>).filter(
          ([, value]) => Number.isFinite(value)
        ).map(([key, value]) => [key, Number(value)])
      )
    : {};

  const intentionsBySlug = raw.intentionsBySlug && typeof raw.intentionsBySlug === 'object'
    ? Object.fromEntries(
        Object.entries(raw.intentionsBySlug as Record<string, unknown>).map(([key, value]) => [
          key,
          typeof value === 'object' && value
            ? {
                selfName: typeof (value as Record<string, unknown>).selfName === 'string' ? (value as Record<string, string>).selfName : undefined,
                counterpartName: typeof (value as Record<string, unknown>).counterpartName === 'string' ? (value as Record<string, string>).counterpartName : undefined,
                wish: typeof (value as Record<string, unknown>).wish === 'string' ? (value as Record<string, string>).wish : undefined,
              }
            : {},
        ])
      )
    : {};

  return {
    enabledOptionalSlugs: Array.isArray(raw.enabledOptionalSlugs)
      ? raw.enabledOptionalSlugs.filter((value): value is string => typeof value === 'string')
      : undefined,
    targetsBySlug,
    intentionsBySlug,
  };
}

function clampTarget(item: TodayChantLikeItem, target: number) {
  if (!Number.isFinite(target)) return item.target;

  let next = Math.round(target);
  if (item.min != null) next = Math.max(item.min, next);
  if (item.max != null) next = Math.min(item.max, next);
  if (item.target != null && item.max == null && item.min == null && next < 1) next = item.target;
  return next;
}

function mergeOpeningPrayer(basePrayer: string | null | undefined, intention?: { selfName?: string; counterpartName?: string; wish?: string }) {
  if (!intention) return basePrayer ?? null;
  const pieces = [intention.selfName, intention.counterpartName, intention.wish].filter(Boolean);
  if (pieces.length === 0) return basePrayer ?? null;

  const summary = `Nguyện hôm nay: ${pieces.join(' · ')}`;
  return basePrayer ? `${summary}\n\n${basePrayer}` : summary;
}

export function applyUserChantConfig<T extends TodayChantLikeItem>(
  items: T[],
  templateConfig: unknown,
  sessionConfig: unknown
): T[] {
  const template = normalizeChantConfig(templateConfig);
  const session = normalizeChantConfig(sessionConfig);

  const enabledOptionalSlugs =
    session.enabledOptionalSlugs ??
    template.enabledOptionalSlugs ??
    null;

  const targetsBySlug = {
    ...(template.targetsBySlug ?? {}),
    ...(session.targetsBySlug ?? {}),
  };

  const intentionsBySlug = {
    ...(template.intentionsBySlug ?? {}),
    ...(session.intentionsBySlug ?? {}),
  };

  return items
    .filter((item) => {
      if (!item.isOptional || !enabledOptionalSlugs) return true;
      return enabledOptionalSlugs.includes(item.slug);
    })
    .map((item) => {
      const configuredTarget = targetsBySlug[item.slug];
      const nextTarget =
        item.kind === 'step' || configuredTarget == null
          ? item.target
          : clampTarget(item, configuredTarget);

      return {
        ...item,
        target: nextTarget,
        openingPrayer: mergeOpeningPrayer(
          typeof item.openingPrayer === 'string' ? item.openingPrayer : null,
          intentionsBySlug[item.slug]
        ),
      };
    });
}
