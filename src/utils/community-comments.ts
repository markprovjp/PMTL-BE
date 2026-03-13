export type CommunityCommentSummary = {
  documentId?: string;
  post?: {
    documentId?: string;
  } | null;
};

export function groupCommentsByPostDocumentId<T extends CommunityCommentSummary>(comments: T[]) {
  const grouped = new Map<string, T[]>();

  for (const comment of comments) {
    const postDocumentId = comment.post?.documentId;
    if (!postDocumentId) continue;

    const existing = grouped.get(postDocumentId);
    if (existing) {
      existing.push(comment);
    } else {
      grouped.set(postDocumentId, [comment]);
    }
  }

  return grouped;
}
