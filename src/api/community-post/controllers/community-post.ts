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
import { groupCommentsByPostDocumentId } from '../../../utils/community-comments';

const POST_UID = 'api::community-post.community-post';
const COMMENT_UID = 'api::community-comment.community-comment';
const UPLOAD_FILE_UID = 'plugin::upload.file';

const SUBMIT_COOLDOWN_MS = RATE_LIMITS.communityPostSubmitMs;
const REPORT_TTL_MS = RATE_LIMITS.reportTtlMs;

function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
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

export default factories.createCoreController(POST_UID, ({ strapi }) => ({
  async createPost(ctx) {
    const log = createLogger(strapi, 'community-post');
    const requesterKey = getRequesterKey(ctx);
    const ipHash = requesterKey.startsWith('ip:') ? requesterKey.slice(3) : hashIp(requesterKey);
    const cooldown = await consumeGuard(strapi, {
      scope: 'community-post-submit',
      key: ipHash,
      windowMs: SUBMIT_COOLDOWN_MS,
      maxHits: 1,
      notes: { ipHash },
    });

    if (!cooldown.allowed) {
      ctx.status = 429;
      ctx.body = { error: `Bạn gửi bài quá nhanh. Vui lòng thử lại sau ${formatWaitTime(cooldown.retryAfterMs)}.` };
      return;
    }

    const { title, content, type, category, author_name, author_avatar, video_url, rating, tags, cover_image } =
      ctx.request.body as any;

    const authUserName = ctx.state?.user?.fullName || ctx.state?.user?.username || '';
    if (!title || !content || !(author_name || authUserName)) {
      return ctx.badRequest('Thiếu thông tin bắt buộc: title, content, author_name');
    }

    const authUserId = ctx.state?.user?.id;
    const postQuery = strapi.db.query(POST_UID as any);
    let processedTags = tags;
    if (typeof tags === 'string') {
      processedTags = tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    }

    const cleanTitle = stripHtmlForModeration(String(title)).slice(0, 300);
    const cleanContent = stripHtmlForModeration(String(content));
    const cleanAuthor = stripHtmlForModeration(String(author_name || authUserName)).slice(0, 100);
    const cleanAvatar = author_avatar ? String(author_avatar).slice(0, 500) : undefined;
    const baseSlug = slugify(cleanTitle) || `community-post-${Date.now()}`;
    const spamScore = computeSpamScore(cleanTitle, cleanContent, video_url);
    const moderation = getInitialModerationState(spamScore);

    try {
      let mediaId: number | undefined;
      if (cover_image !== undefined && cover_image !== null && String(cover_image).trim() !== '') {
        const rawCoverImage = String(cover_image).trim();
        const resolvedMedia = /^\d+$/.test(rawCoverImage)
          ? await strapi.db.query(UPLOAD_FILE_UID).findOne({ where: { id: Number(rawCoverImage) } })
          : await strapi.db.query(UPLOAD_FILE_UID).findOne({ where: { documentId: rawCoverImage } });

        if (!resolvedMedia?.id) {
          return ctx.badRequest('Ảnh bìa không hợp lệ hoặc không còn tồn tại.');
        }

        mediaId = resolvedMedia.id;
      }

      const entity = await postQuery.create({
        data: {
          title: cleanTitle,
          slug: `${baseSlug}-${Date.now().toString(36)}`,
          content: cleanContent,
          type: type || 'story',
          category: category || 'Tâm Linh',
          author_name: cleanAuthor,
          author_avatar: cleanAvatar,
          video_url,
          rating,
          tags: processedTags,
          ...(mediaId ? { cover_image: mediaId } : {}),
          likes: 0,
          views: 0,
          reportCount: 0,
          lastReportReason: null,
          moderationStatus: moderation.moderationStatus,
          isHidden: moderation.isHidden,
          spamScore: moderation.spamScore,
          publishedAt: new Date().toISOString(),
          ...(authUserId ? { user: authUserId as number } : {}),
        } as any,
      });

      ctx.status = 201;
      ctx.body = {
        data: entity,
        message: moderation.isHidden
          ? 'Bài viết đã được ghi nhận nhưng đang tạm ẩn để kiểm tra.'
          : 'Bài viết đã được đăng.',
      };
    } catch (err: any) {
      log.error('createPost failed', { error: err.message, cover_image, userId: authUserId });
      ctx.status = 500;
      ctx.body = { error: err.message || 'Lỗi server khi đăng bài.' };
    }
  },

  async like(ctx) {
    const identifier = String(ctx.params?.identifier ?? ctx.params?.documentId ?? '');
    const log = createLogger(strapi, 'community-post');
    const postQuery = strapi.db.query(POST_UID as any);

    try {
      const existing = await postQuery.findOne({
        where: {
          $and: [
            buildDocumentIdentifierFilters(identifier),
            {
              isHidden: { $ne: true },
              moderationStatus: { $notIn: ['hidden', 'removed'] },
              publishedAt: { $notNull: true },
            },
          ],
        },
        select: ['documentId'],
      });
      if (!existing) return ctx.notFound('Không tìm thấy bài viết');

      const documentId = existing.documentId as string;
      const newLikes = await atomicIncrementField(strapi, POST_UID, documentId, 'likes');
      ctx.body = { likes: newLikes };
    } catch (err: any) {
      log.error('like failed', { error: err.message, identifier });
      ctx.status = 500;
      ctx.body = { error: 'Lỗi server' };
    }
  },

  async incrementView(ctx) {
    const identifier = String(ctx.params?.identifier ?? ctx.params?.documentId ?? '');
    const log = createLogger(strapi, 'community-post');
    const postQuery = strapi.db.query(POST_UID as any);

    try {
      const existing = await postQuery.findOne({
        where: {
          $and: [
            buildDocumentIdentifierFilters(identifier),
            {
              isHidden: { $ne: true },
              moderationStatus: { $notIn: ['hidden', 'removed'] },
              publishedAt: { $notNull: true },
            },
          ],
        },
        select: ['documentId'],
      });
      if (!existing) return ctx.notFound('Không tìm thấy bài viết');

      const documentId = existing.documentId as string;
      const newViews = await atomicIncrementField(strapi, POST_UID, documentId, 'views');
      ctx.status = 200;
      ctx.body = { ok: true, views: newViews };
    } catch (err: any) {
      log.error('incrementView failed', { error: err.message, identifier });
      ctx.status = 500;
      ctx.body = { ok: false, error: 'Lỗi server' };
    }
  },

  async report(ctx) {
    const identifier = String(ctx.params?.identifier ?? ctx.params?.documentId ?? '');
    const reason = ctx.request.body?.reason;
    const log = createLogger(strapi, 'community-post');
    const postQuery = strapi.db.query(POST_UID as any);

    if (!isReportReason(reason)) return ctx.badRequest('Lý do báo cáo không hợp lệ.');

    try {
      const existing = await postQuery.findOne({
        where: {
          ...buildDocumentIdentifierFilters(identifier),
          publishedAt: { $notNull: true },
        },
        select: ['id', 'documentId', 'reportCount', 'moderationStatus', 'isHidden', 'spamScore'],
      });
      if (!existing) return ctx.notFound('Không tìm thấy bài viết.');

      const reporterKey = `${existing.documentId}:${getRequesterKey(ctx)}`;
      const reportGuard = await consumeGuard(strapi, {
        scope: 'community-post-report',
        key: reporterKey,
        windowMs: REPORT_TTL_MS,
        maxHits: 1,
        notes: { documentId: existing.documentId, reason },
      });
      if (!reportGuard.allowed) {
        return ctx.badRequest('Bạn đã báo cáo bài viết này rồi.');
      }

      const nextState = getReportedState({
        reportCount: existing.reportCount ?? 0,
        moderationStatus: existing.moderationStatus ?? 'visible',
        isHidden: existing.isHidden ?? false,
        spamScore: existing.spamScore ?? 0,
      }, reason);
      const updated = await postQuery.update({
        where: { id: existing.id },
        data: nextState,
      });

      ctx.body = {
        data: updated,
        message: nextState.isHidden
          ? 'Cảm ơn bạn. Bài viết đã được ẩn tạm thời để kiểm tra.'
          : 'Cảm ơn bạn. Báo cáo đã được ghi nhận.',
      };
    } catch (err: any) {
      log.error('report failed', { error: err.message, identifier, reason });
      ctx.status = 500;
      ctx.body = { error: 'Không thể báo cáo bài viết lúc này.' };
    }
  },

  async find(ctx) {
    const currentFilters = (ctx.query && typeof ctx.query.filters === 'object' && ctx.query.filters !== null)
      ? ctx.query.filters
      : {};

    ctx.query = {
      ...ctx.query,
      filters: {
        ...currentFilters,
        isHidden: { $ne: true },
        moderationStatus: { $notIn: ['hidden', 'removed'] },
      },
    };

    const { results, pagination } = await (strapi as any).service(POST_UID).find(ctx.query as any);

    const postDocumentIds = results
      .map((post: any) => post?.documentId)
      .filter((value: unknown): value is string => typeof value === 'string' && value.length > 0);

    const allComments = postDocumentIds.length > 0
      ? await strapi.documents(COMMENT_UID as any).findMany({
          filters: {
            post: { documentId: { $in: postDocumentIds } },
            isHidden: { $ne: true },
            moderationStatus: { $notIn: ['hidden', 'removed'] },
          },
          status: 'published',
          fields: ['id', 'documentId', 'content', 'author_name', 'author_avatar', 'likes', 'createdAt'],
          populate: {
            parent: { fields: ['documentId'] },
            post: { fields: ['documentId'] },
          },
          sort: 'createdAt:asc',
        })
      : [];

    const commentsByPost = groupCommentsByPostDocumentId(allComments as any[]);
    const postsWithComments = results.map((post: any) => ({
      ...post,
      comments: commentsByPost.get(post.documentId) ?? [],
    }));

    ctx.body = { data: postsWithComments, meta: { pagination } };
  },

  async findOne(ctx) {
    const identifier = String(ctx.params?.id ?? ctx.params?.identifier ?? ctx.params?.documentId ?? '');

    const postResults = await strapi.documents(POST_UID).findMany({
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
      populate: {
        cover_image: { fields: ['url', 'formats', 'width', 'height', 'alternativeText'] },
      },
      limit: 1,
    });

    const post = postResults[0];
    if (!post) return ctx.notFound('Không tìm thấy bài viết');

    const comments = await strapi.documents(COMMENT_UID as any).findMany({
      filters: {
        post: { documentId: post.documentId },
        isHidden: { $ne: true },
        moderationStatus: { $notIn: ['hidden', 'removed'] },
      },
      status: 'published',
      fields: ['id', 'documentId', 'content', 'author_name', 'author_avatar', 'likes', 'createdAt'],
      populate: { parent: { fields: ['documentId'] } },
      sort: 'createdAt:asc',
    });

    ctx.body = { data: { ...post, comments }, meta: {} };
  },
}));
