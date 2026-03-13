import { groupCommentsByPostDocumentId } from '../src/utils/community-comments';
import { getChangedTopLevelFields } from '../src/utils/object-diff';

describe('content helpers', () => {
  it('detects changed top-level fields and ignores timestamps', () => {
    const beforeValue = {
      title: 'Old',
      slug: 'post-a',
      updatedAt: '2026-03-10T00:00:00.000Z',
      nested: { count: 1 },
    };

    const afterValue = {
      title: 'New',
      slug: 'post-a',
      updatedAt: '2026-03-11T00:00:00.000Z',
      nested: { count: 2 },
    };

    expect(getChangedTopLevelFields(beforeValue, afterValue)).toEqual(['nested', 'title']);
  });

  it('groups comments by post document id', () => {
    const grouped = groupCommentsByPostDocumentId([
      { documentId: 'c1', post: { documentId: 'p1' } },
      { documentId: 'c2', post: { documentId: 'p1' } },
      { documentId: 'c3', post: { documentId: 'p2' } },
      { documentId: 'c4', post: null },
    ]);

    expect(grouped.get('p1')?.map((item) => item.documentId)).toEqual(['c1', 'c2']);
    expect(grouped.get('p2')?.map((item) => item.documentId)).toEqual(['c3']);
    expect(grouped.has('undefined')).toBe(false);
  });
});
