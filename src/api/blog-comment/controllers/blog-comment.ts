import { factories } from '@strapi/strapi';
import { createHash } from 'node:crypto';
import { atomicIncrementField } from '../../../utils/strapi-helpers';
import { createLogger } from '../../../utils/logger';
import { validateBlogCommentSubmit } from '../../../schemas/blog-comment';
import {
  computeSpamScore,
  getInitialModerationState,
  getReportedState,
  isReportReason,
  stripHtmlForModeration,
} from '../../../utils/moderation';
import { formatWaitTime, RATE_LIMITS } from '../../../utils/rate-limit';

const COMMENT_UID = 'api::blog-comment.blog-comment';
const POST_UID = 'api::blog-post.blog-post';

const submitCooldown = new Map<string, number>();
const reportFingerprint = new Map<string, number>();
const COOLDOWN_MS = RATE_LIMITS.blogCommentSubmitMs;
const REPORT_TTL_MS = RATE_LIMITS.reportTtlMs;

function checkCooldown(ipHash: string): boolean {
  const last = submitCooldown.get(ipHash);
  return !!last && Date.now() - last < COOLDOWN_MS;
}

function recordCooldown(ipHash: string): void {
  submitCooldown.set(ipHash, Date.now());
}

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

function recordUniqueReport(targetKey: string): boolean {
  const now = Date.now();
  const existing = reportFingerprint.get(targetKey);
  if (existing && now - existing < REPORT_TTL_MS) return false;
  reportFingerprint.set(targetKey, now);

  if (reportFingerprint.size > 5000) {
    const cutoff = now - REPORT_TTL_MS;
    for (const [key, value] of reportFingerprint.entries()) {
      if (value < cutoff) reportFingerprint.delete(key);
    }
  }

  return true;
}

export default factories.createCoreController(COMMENT_UID, ({ strapi }) => ({
  async submit(ctx) {
    const log = createLogger(strapi, 'blog-comment');
    const requesterKey = getRequesterKey(ctx);
    const ipHash = requesterKey.startsWith('ip:') ? requesterKey.slice(3) : hashIp(requesterKey);

    if (checkCooldown(ipHash)) {
      ctx.status = 429;
      ctx.body = { error: `Bạn gửi bình luận quá nhanh. Vui lòng chờ ${formatWaitTime(COOLDOWN_MS)}.` };
      return;
    }

    const body = ctx.request.body as Record<string, unknown>;
    const validation = validateBlogCommentSubmit(body);
    if (!validation.success) {
      return ctx.badRequest('Dữ liệu không hợp lệ', { errors: validation.error.format() });
    }

    const { postSlug, content, authorName, authorCountry, parentDocumentId, authorAvatar } = validation.data;
    const cleanContent = stripHtmlForModeration(content).slice(0, 2000);
    const fallbackName =
      ctx.state?.user?.fullName ??
      ctx.state?.user?.username ??
      ctx.state?.user?.email ??
      '';
    const cleanName = stripHtmlForModeration(String(authorName || fallbackName)).slice(0, 100);
    const authUserId: number | null = ctx.state?.user?.id ?? null;

    try {
      const posts = await (strapi.documents as any)(POST_UID).findMany({
        filters: { slug: { $eq: postSlug } },
        status: 'published',
        fields: ['documentId', 'id'],
      });
      if (!posts?.length) return ctx.notFound('Không tìm thấy bài viết.');
      const post = posts[0];

      let parentId: number | undefined;
      if (parentDocumentId && typeof parentDocumentId === 'string') {
        const parents = await (strapi.documents(COMMENT_UID as any) as any).findMany({
          filters: {
            documentId: String(parentDocumentId),
            isHidden: { $ne: true },
            moderationStatus: { $notIn: ['hidden', 'removed'] },
            post: { documentId: { $eq: post.documentId } },
          },
          status: 'published',
          fields: ['documentId', 'id'],
          limit: 1,
        });
        if (!parents?.length) return ctx.notFound('Không tìm thấy bình luận cha đang được hiển thị.');
        parentId = parents[0].id;
      }

      const spamScore = computeSpamScore(cleanContent);
      const moderation = getInitialModerationState(spamScore);

      let authorAvatarId: number | null = null;
      if (authorAvatar && typeof authorAvatar === 'string') {
        const rawUrl = authorAvatar.trim();
        if (rawUrl) {
          try {
            const urlPath = rawUrl.startsWith('http') ? new URL(rawUrl).pathname : rawUrl;
            const file = await strapi.db.query('plugin::upload.file').findOne({
              where: { url: urlPath },
              select: ['id'],
            });
            if (file?.id) authorAvatarId = Number(file.id);
          } catch {
            // ignore invalid avatar URL
          }
        }
      }

      const data: Record<string, unknown> = {
        authorName: cleanName,
        authorCountry,
        content: cleanContent,
        post: post.id,
        ...(parentId ? { parent: parentId } : {}),
        ...(authUserId ? { user: authUserId } : {}),
        ...(authorAvatarId ? { authorAvatar: authorAvatarId } : {}),
        ipHash,
        moderationStatus: moderation.moderationStatus,
        isHidden: moderation.isHidden,
        spamScore: moderation.spamScore,
        reportCount: 0,
        lastReportReason: null,
        publishedAt: new Date().toISOString(),
      };

      const entity = await (strapi as any).entityService.create(COMMENT_UID, { data });
      recordCooldown(ipHash);

      ctx.status = 201;
      ctx.body = {
        data: { documentId: entity.documentId },
        message: moderation.isHidden
          ? 'Bình luận đã được ghi nhận nhưng đang tạm ẩn để kiểm tra.'
          : 'Bình luận đã được đăng.',
      };
    } catch (err: any) {
      log.error('submit failed', err);
      ctx.status = 500;
      ctx.body = { error: 'Lỗi server khi gửi bình luận.' };
    }
  },

  async like(ctx) {
    const { documentId } = ctx.params as { documentId: string };
    const log = createLogger(strapi, 'blog-comment');

    try {
      const results = await (strapi.documents(COMMENT_UID as any) as any).findMany({
        filters: {
          documentId,
          isHidden: { $ne: true },
          moderationStatus: { $notIn: ['hidden', 'removed'] },
        },
        status: 'published',
        fields: ['documentId', 'likes'],
        limit: 1,
      });
      const existing = results[0];
      if (!existing) return ctx.notFound('Không tìm thấy bình luận.');

      const newLikes = await atomicIncrementField(strapi, COMMENT_UID, documentId, 'likes');
      ctx.body = { ok: true, likes: newLikes };
    } catch (err) {
      log.error('like failed', err);
      ctx.status = 500;
      ctx.body = { error: 'Lỗi server.' };
    }
  },

  async report(ctx) {
    const { documentId } = ctx.params as { documentId: string };
    const reason = ctx.request.body?.reason;
    const log = createLogger(strapi, 'blog-comment');

    if (!isReportReason(reason)) return ctx.badRequest('Lý do báo cáo không hợp lệ.');
    const reporterKey = `${documentId}:${getRequesterKey(ctx)}`;
    if (!recordUniqueReport(reporterKey)) return ctx.badRequest('Bạn đã báo cáo bình luận này rồi.');

    try {
      const results = await (strapi.documents(COMMENT_UID as any) as any).findMany({
        filters: { documentId },
        status: 'published',
        fields: ['id', 'documentId', 'reportCount', 'moderationStatus', 'isHidden', 'spamScore'],
        limit: 1,
      });
      const existing = results[0];
      if (!existing) return ctx.notFound('Không tìm thấy bình luận.');

      const nextState = getReportedState(existing, reason);
      await (strapi as any).entityService.update(COMMENT_UID, existing.id, { data: nextState });

      ctx.body = {
        message: nextState.isHidden
          ? 'Cảm ơn bạn. Bình luận đã được ẩn tạm thời để kiểm tra.'
          : 'Cảm ơn bạn. Báo cáo đã được ghi nhận.',
      };
    } catch (err) {
      log.error('report failed', err);
      ctx.status = 500;
      ctx.body = { error: 'Không thể báo cáo bình luận lúc này.' };
    }
  },

  async byPost(ctx) {
    const { slug } = ctx.params as { slug: string };
    const page = Math.max(1, parseInt(String(ctx.query['page'] ?? '1'), 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(String(ctx.query['pageSize'] ?? '20'), 10)));
    const log = createLogger(strapi, 'blog-comment');

    try {
      const posts = await (strapi.documents as any)(POST_UID).findMany({
        filters: { slug: { $eq: slug } },
        status: 'published',
        fields: ['documentId'],
      });
      if (!posts?.length) return ctx.notFound('Không tìm thấy bài viết.');
      const post = posts[0];

      const allComments = await (strapi.documents as any)(COMMENT_UID).findMany({
        filters: {
          post: { documentId: { $eq: post.documentId } },
          isHidden: { $ne: true },
          moderationStatus: { $notIn: ['hidden', 'removed'] },
        },
        status: 'published',
        sort: ['createdAt:asc'],
        limit: 500,
        fields: ['documentId', 'authorName', 'content', 'likes', 'createdAt', 'updatedAt'],
        populate: {
          authorAvatar: { fields: ['url', 'formats', 'width', 'height', 'alternativeText'] },
          parent: { fields: ['documentId'] },
        },
      });

      const topLevel = (allComments as any[]).filter((c: any) => !c.parent);
      const replies = (allComments as any[]).filter((c: any) => !!c.parent);
      const total = topLevel.length;
      const pageCount = Math.ceil(total / pageSize);
      const start = (page - 1) * pageSize;
      const paginatedTopLevel = topLevel
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(start, start + pageSize);

      const threaded = paginatedTopLevel.map((comment: any) => ({
        ...comment,
        parent: undefined,
        replies: replies
          .filter((r: any) => r.parent?.documentId === comment.documentId)
          .map((r: any) => ({ ...r, parent: undefined }))
          .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
      }));

      ctx.body = {
        data: threaded,
        meta: { pagination: { page, pageSize, pageCount, total } },
      };
    } catch (err) {
      log.error('byPost failed', err);
      ctx.status = 500;
      ctx.body = { error: 'Lỗi server.' };
    }
  },

  async latest(ctx) {
    const limit = Math.min(20, Math.max(1, parseInt(String(ctx.query['limit'] ?? '5'), 10)));
    const log = createLogger(strapi, 'blog-comment');

    try {
      const comments = await (strapi.documents as any)(COMMENT_UID).findMany({
        filters: {
          parent: null,
          isHidden: { $ne: true },
          moderationStatus: { $notIn: ['hidden', 'removed'] },
        },
        status: 'published',
        sort: ['createdAt:desc'],
        limit,
        fields: ['documentId', 'authorName', 'content', 'createdAt'],
        populate: {
          post: { fields: ['documentId', 'slug', 'title'] },
        },
      });

      ctx.body = { data: comments ?? [] };
    } catch (err) {
      log.error('latest failed', err);
      ctx.status = 500;
      ctx.body = { error: 'Lỗi server.' };
    }
  },
}));
