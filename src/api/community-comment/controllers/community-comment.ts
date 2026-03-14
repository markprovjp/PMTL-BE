import { factories } from '@strapi/strapi';
import { createHash } from 'node:crypto';
import { atomicIncrementField, buildDocumentIdentifierFilters } from '../../../utils/strapi-helpers';
import { createLogger } from '../../../utils/logger';
import {
  computeSpamScore,
  getInitialModerationState,
  getReportedState,
  isReportReason,
  stripHtmlForModeration,
} from '../../../utils/moderation';
import { formatWaitTime, RATE_LIMITS } from '../../../utils/rate-limit';
import { consumeGuard } from '../../../services/request-guard';

const COMMENT_UID = 'api::community-comment.community-comment';
const POST_UID = 'api::community-post.community-post';

const COOLDOWN_MS = RATE_LIMITS.communityCommentSubmitMs;
const REPORT_TTL_MS = RATE_LIMITS.reportTtlMs;

function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

function getRequesterKey(ctx: any): string {
  const userId = ctx.state?.user?.id;
  if (userId) return `user:${userId}`;
  const rawIp =
    (ctx.request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
    ctx.request.ip ??
    'unknown';
  return `ip:${hashIp(rawIp)}`;
}

export default factories.createCoreController(COMMENT_UID, ({ strapi }) => ({
  async createComment(ctx) {
    const log = createLogger(strapi, 'community-comment');
    const requesterKey = getRequesterKey(ctx);
    const ipHash = requesterKey.startsWith('ip:') ? requesterKey.slice(3) : hashIp(requesterKey);

    const cooldown = await consumeGuard(strapi, {
      scope: 'community-comment-submit',
      key: ipHash,
      windowMs: COOLDOWN_MS,
      maxHits: 1,
      notes: { ipHash },
    });

    if (!cooldown.allowed) {
      ctx.status = 429;
      ctx.body = { error: `Bạn gửi bình luận quá nhanh. Vui lòng chờ ${formatWaitTime(cooldown.retryAfterMs)}.` };
      return;
    }

    const body = ctx.request.body as Record<string, unknown>;
    const { postDocumentId, content, author_name, author_avatar, parentDocumentId } = body;

    if (!content || typeof content !== 'string') return ctx.badRequest('Nội dung bình luận không được trống.');
    if (!author_name || typeof author_name !== 'string') return ctx.badRequest('Thiếu tên tác giả.');
    if (!postDocumentId || typeof postDocumentId !== 'string') return ctx.badRequest('Thiếu bài viết (postDocumentId).');

    const cleanContent = stripHtmlForModeration(content).slice(0, 2000);
    const cleanName = stripHtmlForModeration(String(author_name)).slice(0, 100);
    const authUserId: number | null = ctx.state?.user?.id ?? null;
    const commentQuery = strapi.db.query(COMMENT_UID as any);
    const postQuery = strapi.db.query(POST_UID as any);

    try {
      const post = await postQuery.findOne({
        where: {
          documentId: postDocumentId,
          isHidden: { $ne: true },
          moderationStatus: { $notIn: ['hidden', 'removed'] },
          publishedAt: { $notNull: true },
        },
        select: ['id', 'documentId'],
      });
      if (!post) {
        return ctx.notFound('Không tìm thấy bài viết hoặc bài viết đang bị ẩn.');
      }

      let parentId: number | null = null;
      if (parentDocumentId && typeof parentDocumentId === 'string') {
        const parentComment = await commentQuery.findOne({
          where: {
            documentId: parentDocumentId,
            isHidden: { $ne: true },
            moderationStatus: { $notIn: ['hidden', 'removed'] },
            publishedAt: { $notNull: true },
          },
          select: ['id', 'documentId'],
          populate: {
            post: {
              select: ['documentId'],
            },
          },
        });
        if (!parentComment) return ctx.notFound('Không tìm thấy bình luận cha đang được hiển thị.');
        if (parentComment.post?.documentId !== postDocumentId) {
          return ctx.badRequest('Bình luận cha không thuộc về bài viết này.');
        }
        parentId = parentComment.id;
      }

      const spamScore = computeSpamScore(cleanContent);
      const moderation = getInitialModerationState(spamScore);

      const entity = await commentQuery.create({
        data: {
          content: cleanContent,
          author_name: cleanName,
          author_avatar: author_avatar ? String(author_avatar).slice(0, 500) : undefined,
          user: authUserId,
          post: post.id,
          parent: parentId,
          likes: 0,
          reportCount: 0,
          lastReportReason: null,
          moderationStatus: moderation.moderationStatus,
          isHidden: moderation.isHidden,
          spamScore: moderation.spamScore,
          publishedAt: new Date().toISOString(),
        },
      });

      ctx.status = 201;
      ctx.body = {
        data: entity,
        message: moderation.isHidden
          ? 'Bình luận đã được ghi nhận nhưng đang tạm ẩn để kiểm tra.'
          : 'Bình luận đã được đăng.',
      };
    } catch (err: any) {
      log.error('createComment failed', { error: err.message, postDocumentId, parentDocumentId });
      ctx.status = 500;
      ctx.body = { error: `Lỗi server khi gửi bình luận: ${err.message}` };
    }
  },

  async likeComment(ctx) {
    const identifier = String(ctx.params?.identifier ?? ctx.params?.documentId ?? '');
    const log = createLogger(strapi, 'community-comment');

    try {
      const results = await strapi.documents(COMMENT_UID as any).findMany({
        filters: {
          $and: [
            buildDocumentIdentifierFilters(identifier),
            {
              isHidden: { $ne: true },
              moderationStatus: { $notIn: ['hidden', 'removed'] },
            },
          ],
        },
        status: 'published',
        fields: ['documentId'],
        limit: 1,
      });
      const existing = results[0];
      if (!existing) return ctx.notFound('Không tìm thấy bình luận');

      const documentId = existing.documentId as string;
      const newLikes = await atomicIncrementField(strapi, COMMENT_UID, documentId, 'likes');
      ctx.body = { likes: newLikes };
    } catch (err: any) {
      log.error('likeComment failed', { error: err.message, identifier });
      ctx.status = 500;
      ctx.body = { error: 'Lỗi server' };
    }
  },

  async reportComment(ctx) {
    const identifier = String(ctx.params?.identifier ?? ctx.params?.documentId ?? '');
    const reason = ctx.request.body?.reason;
    const log = createLogger(strapi, 'community-comment');
    const commentQuery = strapi.db.query(COMMENT_UID as any);

    if (!isReportReason(reason)) {
      return ctx.badRequest('Lý do báo cáo không hợp lệ.');
    }

    try {
      const existing = await commentQuery.findOne({
        where: {
          ...buildDocumentIdentifierFilters(identifier),
          publishedAt: { $notNull: true },
        },
        select: ['id', 'documentId', 'reportCount', 'moderationStatus', 'isHidden', 'spamScore'],
      });
      if (!existing) return ctx.notFound('Không tìm thấy bình luận.');

      const reporterKey = `${existing.documentId}:${getRequesterKey(ctx)}`;
      const reportGuard = await consumeGuard(strapi, {
        scope: 'community-comment-report',
        key: reporterKey,
        windowMs: REPORT_TTL_MS,
        maxHits: 1,
        notes: { documentId: existing.documentId, reason },
      });
      if (!reportGuard.allowed) {
        return ctx.badRequest('Bạn đã báo cáo bình luận này rồi.');
      }

      const nextState = getReportedState(existing, reason);
      const updated = await commentQuery.update({
        where: { id: existing.id },
        data: nextState,
      });

      ctx.body = {
        data: updated,
        message: nextState.isHidden
          ? 'Cảm ơn bạn. Bình luận đã được ẩn tạm thời để kiểm tra.'
          : 'Cảm ơn bạn. Báo cáo đã được ghi nhận.',
      };
    } catch (err: any) {
      log.error('reportComment failed', { error: err.message, identifier, reason });
      ctx.status = 500;
      ctx.body = { error: 'Không thể báo cáo bình luận lúc này.' };
    }
  },
}));
