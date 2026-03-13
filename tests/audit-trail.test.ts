import { getTrackedAuditModelUids } from '../src/index';

describe('audit trail lifecycle registration', () => {
  it('tracks only regular api content types and skips internal system collections', () => {
    const strapi = {
      contentTypes: {
        'api::sutra-chapter.sutra-chapter': {},
        'api::community-post.community-post': {},
        'api::audit-log.audit-log': {},
        'api::content-history.content-history': {},
        'api::request-guard.request-guard': {},
        'plugin::users-permissions.user': {},
      },
    } as any;

    expect(getTrackedAuditModelUids(strapi)).toEqual([
      'api::sutra-chapter.sutra-chapter',
      'api::community-post.community-post',
    ]);
  });
});
