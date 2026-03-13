import { cleanupExpiredGuards, consumeGuard } from '../src/services/request-guard';

function createStrapiMock() {
  const rows: any[] = [];
  let idCounter = 1;

  const query = {
    async findOne({ where }: any) {
      return rows.find((item) => item.guardKey === where.guardKey) ?? null;
    },
  };

  const documents = (_uid: string) => ({
    async create({ data }: any) {
      const row = {
        id: idCounter++,
        documentId: `guard-${idCounter}`,
        ...data,
      };
      rows.push(row);
      return row;
    },
    async update({ documentId, data }: any) {
      const index = rows.findIndex((item) => item.documentId === documentId);
      rows[index] = { ...rows[index], ...data };
      return rows[index];
    },
    async findMany({ filters }: any) {
      if (!filters?.expiresAt?.$lt) return [];
      return rows.filter((item) => item.expiresAt < filters.expiresAt);
    },
    async delete({ documentId }: any) {
      const index = rows.findIndex((item) => item.documentId === documentId);
      if (index >= 0) rows.splice(index, 1);
      return null;
    },
  });

  return {
    rows,
    strapi: {
      db: {
        query: () => query,
      },
      documents,
    } as any,
  };
}

describe('request guard', () => {
  it('allows first hit and blocks duplicate hit within the window', async () => {
    const { strapi } = createStrapiMock();

    const first = await consumeGuard(strapi, {
      scope: 'community-post-submit',
      key: 'ip:abc',
      windowMs: 60_000,
      maxHits: 1,
    });
    const second = await consumeGuard(strapi, {
      scope: 'community-post-submit',
      key: 'ip:abc',
      windowMs: 60_000,
      maxHits: 1,
    });

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(false);
    expect(second.retryAfterMs).toBeGreaterThan(0);
  });

  it('resets an expired guard and cleans it up', async () => {
    const { rows, strapi } = createStrapiMock();

    await consumeGuard(strapi, {
      scope: 'blog-comment-report',
      key: 'comment-1:user-1',
      windowMs: 10,
      maxHits: 1,
    });

    rows[0].expiresAt = '2000-01-01T00:00:00.000Z';

    const next = await consumeGuard(strapi, {
      scope: 'blog-comment-report',
      key: 'comment-1:user-1',
      windowMs: 60_000,
      maxHits: 1,
    });

    rows.push({
      id: 999,
      documentId: 'guard-old',
      guardKey: 'old',
      expiresAt: '2000-01-01T00:00:00.000Z',
    });

    const deleted = await cleanupExpiredGuards(strapi, 10);

    expect(next.allowed).toBe(true);
    expect(deleted).toBe(2);
  });
});
