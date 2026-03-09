const SPAM_LINK_REGEX = /https?:\/\/|www\.|t\.me\/|telegram\.me|bit\.ly|tinyurl|zalo\.me/gi;
const REPEATED_CHAR_REGEX = /([^\s])\1{9,}/g;
const REPEATED_WORD_REGEX = /\b(\w+)(?:\s+\1){4,}\b/gi;

export const REPORT_REASONS = [
  'spam',
  'abuse',
  'off-topic',
  'unsafe',
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];
export type ModerationStatus = 'visible' | 'flagged' | 'hidden' | 'removed';

export interface ModerationState {
  moderationStatus: ModerationStatus;
  isHidden: boolean;
  spamScore: number;
  reportCount: number;
  lastReportReason?: string | null;
}

export function stripHtmlForModeration(input: string): string {
  return input.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

export function computeSpamScore(...parts: Array<string | null | undefined>): number {
  const text = parts.filter(Boolean).join(' ').trim();
  if (!text) return 0;

  let score = 0;
  const links = text.match(SPAM_LINK_REGEX);
  if (links?.length) score += Math.min(links.length * 2, 6);
  if (REPEATED_CHAR_REGEX.test(text)) score += 3;
  if (REPEATED_WORD_REGEX.test(text)) score += 2;
  if (text.length > 1800) score += 1;
  if ((text.match(/[!?.]/g) || []).length > 20) score += 1;

  return score;
}

export function getInitialModerationState(spamScore: number): Pick<ModerationState, 'moderationStatus' | 'isHidden' | 'spamScore'> {
  if (spamScore >= 6) {
    return {
      moderationStatus: 'hidden',
      isHidden: true,
      spamScore,
    };
  }

  if (spamScore >= 3) {
    return {
      moderationStatus: 'flagged',
      isHidden: false,
      spamScore,
    };
  }

  return {
    moderationStatus: 'visible',
    isHidden: false,
    spamScore,
  };
}

export function isReportReason(value: unknown): value is ReportReason {
  return typeof value === 'string' && REPORT_REASONS.includes(value as ReportReason);
}

export function getReportedState(current: Pick<ModerationState, 'reportCount' | 'moderationStatus' | 'isHidden' | 'spamScore'>, reason: ReportReason) {
  const reportCount = (current.reportCount ?? 0) + 1;
  let moderationStatus: ModerationStatus = current.moderationStatus ?? 'visible';
  let isHidden = current.isHidden ?? false;

  if (moderationStatus !== 'removed') {
    if (reportCount >= 3 || current.spamScore >= 6) {
      moderationStatus = 'hidden';
      isHidden = true;
    } else if (reportCount >= 2) {
      moderationStatus = 'flagged';
    }
  }

  return {
    reportCount,
    moderationStatus,
    isHidden,
    lastReportReason: reason,
  };
}
