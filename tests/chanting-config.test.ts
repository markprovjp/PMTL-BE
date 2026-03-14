import { applyUserChantConfig, normalizeChantConfig } from '../src/api/chant-plan/utils/today-chant';

describe('chanting config merge', () => {
  it('normalizes malformed config safely', () => {
    expect(normalizeChantConfig(null)).toEqual({});
    expect(normalizeChantConfig({ enabledOptionalSlugs: ['chu-dai-bi', 1] })).toEqual({
      enabledOptionalSlugs: ['chu-dai-bi'],
      targetsBySlug: {},
      intentionsBySlug: {},
    });
  });

  it('filters optional items and applies target precedence', () => {
    const items = [
      { slug: 'core', kind: 'mantra', isOptional: false, target: 21, min: 7, max: 49, openingPrayer: null },
      { slug: 'optional', kind: 'mantra', isOptional: true, target: 27, min: 21, max: 49, openingPrayer: null },
    ];

    const result = applyUserChantConfig(
      items,
      { enabledOptionalSlugs: ['optional'], targetsBySlug: { optional: 30 } },
      { enabledOptionalSlugs: [], targetsBySlug: { core: 100 } }
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ slug: 'core', target: 49 });
  });

  it('merges intention into opening prayer', () => {
    const [item] = applyUserChantConfig(
      [{ slug: 'giai-ket-chu', kind: 'mantra', isOptional: false, target: 21, min: 21, max: 49, openingPrayer: 'Bài mẫu' }],
      {},
      { intentionsBySlug: { 'giai-ket-chu': { selfName: 'An', counterpartName: 'Bình', wish: 'hóa giải ác duyên' } } }
    );

    expect(item.openingPrayer).toContain('Nguyện hôm nay: An · Bình · hóa giải ác duyên');
    expect(item.openingPrayer).toContain('Bài mẫu');
  });
});
