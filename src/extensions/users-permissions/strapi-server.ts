// ─────────────────────────────────────────────────────────────
//  src/extensions/users-permissions/strapi-server.ts
//  Mở mở rộng callback xác thực: Tải ảnh từ Google và upload vào Media Strapi
// ─────────────────────────────────────────────────────────────
import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';

export default (plugin: any) => {
  const originalCallback = plugin.controllers.auth.callback;

  plugin.controllers.auth.callback = async (ctx: any) => {
    await originalCallback(ctx);

    const provider = ctx.params?.provider || 'local';
    if (provider !== 'google') return;

    const body = ctx.body as { jwt?: string; user?: any } | undefined;
    if (!body?.jwt || !body?.user) return;

    const strapiUser = body.user;
    const accessToken = ctx.query?.access_token;

    try {
      if (accessToken && strapiUser.id) {
        strapi.log.info(`[Google Auth] Đồng bộ cho: ${strapiUser.email}`);

        const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (res.ok) {
          const profile = (await res.json()) as any;
          const fullNameFromGoogle = profile.name || "";
          const googleAvatarUrl = profile.picture || "";

          // 1. Cập nhật FullName nếu thiếu
          if (fullNameFromGoogle && (!strapiUser.fullName || strapiUser.fullName === "")) {
            await strapi.db.query('plugin::users-permissions.user').update({
              where: { id: strapiUser.id },
              data: { fullName: fullNameFromGoogle }
            });
            ctx.body.user.fullName = fullNameFromGoogle;
          }

          // 2. Xử lý Ảnh đại diện (Tải từ Google vào Strapi Media)
          // Chỉ tải nếu chưa có avatar
          if (googleAvatarUrl && (!strapiUser.avatar_url)) {
            strapi.log.info(`[Google Auth] Đang tải ảnh từ Google về Media Strapi...`);

            try {
              const response = await axios.get(googleAvatarUrl, { responseType: 'arraybuffer' });
              const tmpDir = path.join(process.cwd(), '.tmp');
              await fs.ensureDir(tmpDir);

              const fileName = `avatar_${strapiUser.id}.jpg`;
              const filePath = path.join(tmpDir, fileName);
              await fs.outputFile(filePath, response.data);

              const uploadService = strapi.plugin('upload').service('upload');
              const uploadedFiles = await uploadService.upload({
                data: {
                  fileInfo: { caption: `Google Avatar for ${strapiUser.email}`, name: fileName },
                },
                files: {
                  path: filePath,
                  name: fileName,
                  type: 'image/jpeg',
                  size: response.data.length,
                },
              });

              if (uploadedFiles && uploadedFiles[0]) {
                const mediaId = uploadedFiles[0].id;
                await strapi.db.query('plugin::users-permissions.user').update({
                  where: { id: strapiUser.id },
                  data: { avatar_url: mediaId }
                });

                // Gán lại object media vào body để FE nhận được URL
                ctx.body.user.avatar_url = uploadedFiles[0];
                strapi.log.info(`[Google Auth] Đã tạo file Media ID: ${mediaId}`);
              }

              // Xóa file tạm
              await fs.remove(filePath).catch(() => { });
            } catch (err) {
              strapi.log.error(`[Google Auth] Lỗi khi tải/upload file:`, err);
            }
          }
        }
      }
    } catch (err) {
      strapi.log.error('[Google Auth] Lỗi hệ thống:', err);
    }
  };

  // Controller updateMe
  plugin.controllers.user.updateMe = async (ctx: any) => {
    if (!ctx.state.user || !ctx.state.user.id) return ctx.unauthorized();
    const { data } = ctx.request.body;

    try {
      // populate để lấy thông tin ảnh đầy đủ nếu cần
      const updatedUser = await strapi.db.query('plugin::users-permissions.user').update({
        where: { id: ctx.state.user.id },
        data,
        populate: ['avatar_url']
      });
      ctx.body = updatedUser;
    } catch (err) {
      ctx.throw(500, err);
    }
  };

  plugin.routes['content-api'].routes.unshift({
    method: 'PUT',
    path: '/users/me',
    handler: 'user.updateMe',
    config: { prefix: '', policies: [] },
  });

  return plugin;
};
