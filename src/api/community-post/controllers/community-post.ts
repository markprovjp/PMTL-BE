/**
 * community-post controller (Strapi v5)
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::community-post.community-post', ({ strapi }) => ({
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

    const entity = await strapi.documents('api::community-post.community-post').create({
      data: {
        title,
        content,
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

  // POST /api/community-posts/like/:id - Tăng like
  async like(ctx) {
    const { id } = ctx.params as any;

    try {
      // 1. Tìm bằng documentId trước
      let existing = await strapi.documents('api::community-post.community-post').findOne({
        documentId: id,
        status: 'published',
      });

      // 2. Nếu không thấy, thử tìm bằng integer id dùng db.query
      if (!existing && !isNaN(Number(id))) {
        const results = await strapi.db.query('api::community-post.community-post').findMany({
          where: { id: Number(id) },
        });
        if (results && results.length > 0) {
          // Lấy documentId từ db.query results
          const documentId = (results[0] as any).documentId;
          existing = await strapi.documents('api::community-post.community-post').findOne({
            documentId,
            status: 'published',
          });
        }
      }

      if (!existing) return ctx.notFound('Không tìm thấy bài viết');

      const updated = await strapi.documents('api::community-post.community-post').update({
        documentId: existing.documentId,
        status: 'published',
        data: { likes: (existing.likes || 0) + 1 },
      });

      ctx.body = { likes: (updated as any).likes };
    } catch (error) {
      console.error('[CommunityPost like] error:', error);
      ctx.status = 500;
      ctx.body = { error: 'Lỗi server' };
    }
  },

  // POST /api/community-posts/:documentId/view - Tăng lượt xem
  async incrementView(ctx) {
    const { documentId } = ctx.params as any;
    try {
      let existing = await strapi.documents('api::community-post.community-post').findOne({
        documentId,
        status: 'published',
      });
      if (!existing) return ctx.notFound('Không tìm thấy bài viết');

      const nextViews = (existing.views || 0) + 1;
      await strapi.documents('api::community-post.community-post').update({
        documentId: existing.documentId,
        status: 'published',
        data: { views: nextViews },
      });

      ctx.status = 200;
      ctx.body = { ok: true, views: nextViews };
    } catch (error) {
      console.error('[incrementView] error:', error);
      ctx.status = 500;
      ctx.body = { ok: false, error: 'Lỗi server' };
    }
  },

  // Override find - cấm populate[comments]=* vì gây vòng lặp post->comment->post
  // Thay vào đó dùng db.query để tìm comments theo post id thủ công
  async find(ctx) {
    // Gọi paginateResults từ super để giữ meta pagination
    const { results, pagination } = await (strapi as any).service('api::community-post.community-post').find(ctx.query as any);

    // Với mỗi post, fetch comments thủ công qua db.query (không vòng lặp)
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
    const post = await strapi.documents('api::community-post.community-post').findOne({
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
