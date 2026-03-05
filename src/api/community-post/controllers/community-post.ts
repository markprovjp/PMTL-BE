/**
 * community-post controller (Strapi v5)
 */

import { factories } from '@strapi/strapi';
import { atomicIncrementField } from '../../../utils/strapi-helpers';
import { createLogger } from '../../../utils/logger';

const POST_UID = 'api::community-post.community-post';

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '').trim();
}

export default factories.createCoreController(POST_UID, ({ strapi }) => ({
  // POST /api/community-posts/submit - Gửi bài mới, không cần auth
  async createPost(ctx) {
    const { title, content, type, category, author_name, author_country, author_avatar, video_url, rating, tags, cover_image } =
      ctx.request.body as any;

    if (!title || !content || !author_name) {
      return ctx.badRequest('Thiếu thông tin bắt buộc: title, content, author_name');
    }

    // Xử lý tags: nếu là chuỗi thì tách ra, nếu là mảng thì giữ nguyên
    let processedTags = tags;
    if (typeof tags === 'string') {
      processedTags = tags.split(',').map((t: string) => t.trim()).filter((t: string) => t !== '');
    }

    const entity = await strapi.documents(POST_UID).create({
      data: {
        title,
        content: stripHtml(content),
        type: type || 'story',
        category: category || 'Tâm Linh',
        author_name,
        author_country: author_country || 'Việt Nam',
        author_avatar,
        video_url,
        tags: processedTags,
        cover_image,
        likes: 0,
        views: 0,
        // Draft: cần admin duyệt trước khi publish
      },
    });

    ctx.status = 201;
    ctx.body = { data: entity, message: 'Bài viết đang chờ kiểm duyệt!' };
  },

  // POST /api/community-posts/like/:documentId - Tang like
  async like(ctx) {
    const { documentId } = ctx.params as any;
    const log = createLogger(strapi, 'community-post');

    try {
      const existing = await strapi.documents(POST_UID).findOne({
        documentId,
        status: 'published',
        fields: ['documentId'],
      });
      if (!existing) return ctx.notFound('Không tìm thấy bài viết');

      const newLikes = await atomicIncrementField(strapi, POST_UID, documentId, 'likes');
      ctx.body = { likes: newLikes };
    } catch (err) {
      log.error('like failed', err);
      ctx.status = 500;
      ctx.body = { error: 'Lỗi server' };
    }
  },

  // POST /api/community-posts/:documentId/view - Tang luot xem
  async incrementView(ctx) {
    const { documentId } = ctx.params as any;
    const log = createLogger(strapi, 'community-post');

    try {
      const existing = await strapi.documents(POST_UID).findOne({
        documentId,
        status: 'published',
        fields: ['documentId'],
      });
      if (!existing) return ctx.notFound('Không tìm thấy bài viết');

      const newViews = await atomicIncrementField(strapi, POST_UID, documentId, 'views');
      ctx.status = 200;
      ctx.body = { ok: true, views: newViews };
    } catch (err) {
      log.error('incrementView failed', err);
      ctx.status = 500;
      ctx.body = { ok: false, error: 'Lỗi server' };
    }
  },

  // Override find - cấm populate[comments]=* vì gây vòng lặp post->comment->post
  // Thay vào đó dùng db.query để tìm comments theo post id thủ công
  async find(ctx) {
    // Gọi paginateResults từ super để giữ meta pagination
    const { results, pagination } = await (strapi as any).service(POST_UID).find(ctx.query as any);

    // Voi moi post, fetch comments thu cong qua documents API (khong vong lap)
    const postsWithComments = await Promise.all(
      results.map(async (post: any) => {
        const comments = await strapi.documents('api::community-comment.community-comment' as any).findMany({
          filters: {
            post: { documentId: post.documentId },
          },
          status: 'published',
          fields: ['id', 'documentId', 'content', 'author_name', 'author_avatar', 'author_country', 'likes', 'parent_id', 'createdAt'],
          sort: 'createdAt:asc',
        });
        return { ...post, comments };
      })
    );

    ctx.body = { data: postsWithComments, meta: { pagination } };
  },

  // Override findOne - tương tự
  async findOne(ctx) {
    const { id } = ctx.params as any;
    const query = ctx.query as any;

    // Dùng document service với populate cover_image
    const post = await strapi.documents(POST_UID).findOne({
      documentId: id,
      status: 'published',
      populate: { cover_image: true },
    });

    if (!post) return ctx.notFound('Không tìm thấy bài viết');

    const comments = await strapi.documents('api::community-comment.community-comment' as any).findMany({
      filters: {
        post: { documentId: post.documentId },
      },
      status: 'published',
      fields: ['id', 'documentId', 'content', 'author_name', 'author_avatar', 'author_country', 'likes', 'parent_id', 'createdAt'],
      sort: 'createdAt:asc',
    });

    ctx.body = { data: { ...post, comments }, meta: {} };
  },
}));
