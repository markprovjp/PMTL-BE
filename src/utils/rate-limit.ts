const isProd = process.env.NODE_ENV === 'production';

function readMs(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;

  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function defaultMs(devValue: number, prodValue: number): number {
  return isProd ? prodValue : devValue;
}

export const RATE_LIMITS = {
  communityPostSubmitMs: readMs('RATE_LIMIT_COMMUNITY_POST_SUBMIT_MS', defaultMs(10_000, 300_000)),
  communityCommentSubmitMs: readMs('RATE_LIMIT_COMMUNITY_COMMENT_SUBMIT_MS', defaultMs(10_000, 60_000)),
  blogCommentSubmitMs: readMs('RATE_LIMIT_BLOG_COMMENT_SUBMIT_MS', defaultMs(10_000, 60_000)),
  guestbookSubmitMs: readMs('RATE_LIMIT_GUESTBOOK_SUBMIT_MS', defaultMs(15_000, 120_000)),
  blogViewCooldownMs: readMs('RATE_LIMIT_BLOG_VIEW_MS', defaultMs(60_000, 3_600_000)),
  reportTtlMs: readMs('RATE_LIMIT_REPORT_TTL_MS', defaultMs(3_600_000, 86_400_000)),
} as const;

export function formatWaitTime(ms: number): string {
  if (ms < 60_000) {
    return `${Math.max(1, Math.round(ms / 1000))} giây`;
  }

  const minutes = Math.max(1, Math.round(ms / 60_000));
  return `${minutes} phút`;
}
