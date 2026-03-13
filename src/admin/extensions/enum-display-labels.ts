const TARGET_CONTENT_TYPES = new Set([
  'api::community-post.community-post',
  'api::blog-comment.blog-comment',
  'api::community-comment.community-comment',
  'api::guestbook-entry.guestbook-entry',
]);

const ENUM_DISPLAY_LABELS: Record<string, Record<string, Record<string, string>>> = {
  'api::community-post.community-post': {
    type: {
      story: 'Chia sẻ',
      feedback: 'Góp ý',
      video: 'Video',
    },
    moderationStatus: {
      visible: 'Hiển thị',
      flagged: 'Cần xem lại',
      hidden: 'Đã ẩn',
      removed: 'Đã gỡ',
    },
  },
  'api::blog-comment.blog-comment': {
    moderationStatus: {
      visible: 'Hiển thị',
      flagged: 'Cần xem lại',
      hidden: 'Đã ẩn',
      removed: 'Đã gỡ',
    },
  },
  'api::community-comment.community-comment': {
    moderationStatus: {
      visible: 'Hiển thị',
      flagged: 'Cần xem lại',
      hidden: 'Đã ẩn',
      removed: 'Đã gỡ',
    },
  },
  'api::guestbook-entry.guestbook-entry': {
    approvalStatus: {
      pending: 'Chờ duyệt',
      approved: 'Đã duyệt',
    },
    entryType: {
      message: 'Lời nhắn',
      question: 'Câu hỏi',
    },
  },
};

function getLabelFromMap(model: string | null, fieldName: string, value: string) {
  if (!model) return null;
  return ENUM_DISPLAY_LABELS[model]?.[fieldName]?.[value] ?? null;
}

export function shouldTranslateEnumDisplay(model: string | null) {
  return Boolean(model && TARGET_CONTENT_TYPES.has(model));
}

export function resolveEnumDisplayLabel(model: string | null, fieldName: string, value: string) {
  return getLabelFromMap(model, fieldName, value) ?? value;
}
