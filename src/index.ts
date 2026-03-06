import type { Core } from '@strapi/strapi';
import fs from 'fs-extra';
import path from 'path';

export default {
  async register({ strapi }: { strapi: Core.Strapi }) {
    // Check if google-auth-config.json exists in root
    const configPath = path.join(process.cwd(), 'google-auth-config.json');

    if (await fs.pathExists(configPath)) {
      try {
        const config = await fs.readJson(configPath);
        strapi.log.info('[Google Auth] Loading dynamic configuration...');

        // Dynamically set env vars for Google Provider
        if (config.clientId) process.env.GOOGLE_CLIENT_ID = config.clientId;
        if (config.clientSecret) process.env.GOOGLE_CLIENT_SECRET = config.clientSecret;
        if (config.redirectUri) process.env.GOOGLE_REDIRECT_URI = config.redirectUri;

        strapi.log.info('[Google Auth] Environment variables set from config file.');
      } catch (err) {
        strapi.log.error('[Google Auth] Failed to read config file:', err);
      }
    }

    // 2.5) Prevent server crash on Windows EPERM / unlink errors ONLY
    process.on('uncaughtException', (err: any) => {
      if (err.code === 'EPERM' && err.syscall === 'unlink') {
        strapi.log.warn(`[Windows Fix] Ignored EPERM error during file cleanup: ${err.path}`);
        return; // swallow this specific error only
      }
      // Re-throw all other errors so Strapi/Node can handle them normally
      strapi.log.error('[CRITICAL] Uncaught Exception:', err);
      process.exit(1);
    });
  },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // 1) Ensure advanced settings aren't null (fixes undefined 'settings' UI bug)
    try {
      const advancedStore = strapi.store({ type: 'plugin', name: 'users-permissions', key: 'advanced' });
      const advancedSettings = await advancedStore.get();
      if (!advancedSettings) {
        await advancedStore.set({
          value: {
            unique_email: true,
            allow_register: true,
            email_confirmation: false,
            email_reset_password: null,
            email_confirmation_redirection: null,
            default_role: 'authenticated',
          }
        });
        strapi.log.info('[Fix] Re-initialized missing user-permissions advanced settings.');
      }
    } catch (err) {
      strapi.log.error('[Fix] Could not init advanced settings', err);
    }

    // 1.5) Auto-repair users that are missing a role (due to earlier schema issues)
    try {
      const usersWithoutRole = await strapi.db.query('plugin::users-permissions.user').findMany({
        where: { role: null },
      });
      if (usersWithoutRole && usersWithoutRole.length > 0) {
        const defaultRole = await strapi.db.query('plugin::users-permissions.role').findOne({
          where: { type: 'authenticated' },
        });
        if (defaultRole) {
          for (const u of usersWithoutRole) {
            await strapi.db.query('plugin::users-permissions.user').update({
              where: { id: u.id },
              data: { role: defaultRole.id },
            });
          }
          strapi.log.info(`[Fix] Assigned default role to ${usersWithoutRole.length} users.`);
        }
      }
    } catch (err) {
      strapi.log.error('[Fix] Failed to auto-repair user roles:', err);
    }

    // 1.7) Cấp quyền public cho community APIs
    try {
      const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'public' },
        populate: ['permissions'],
      });
      if (publicRole) {
        const allPerms = await strapi.db.query('plugin::users-permissions.permission').findMany({
          where: { role: publicRole.id },
        });
        const communityRoutes = [
          'api::community-post.community-post.find',
          'api::community-post.community-post.findOne',
          'api::community-post.community-post.like',
          'api::community-post.community-post.createPost',
          'api::community-post.community-post.incrementView',
          // community-comment: cần cấp find VÀ findOne để populate comments trong post
          'api::community-comment.community-comment.find',
          'api::community-comment.community-comment.findOne',
          'api::community-comment.community-comment.createComment',
          'api::community-comment.community-comment.likeComment',
          // event
          'api::event.event.find',
          'api::event.event.findOne',
        ];
        for (const action of communityRoutes) {
          const existing = allPerms.find((p: any) => p.action === action);
          if (!existing) {
            await strapi.db.query('plugin::users-permissions.permission').create({
              data: { action, role: publicRole.id, enabled: true },
            });
          } else if (!existing.enabled) {
            // Đảm bảo permission đã tồn tại thì phải ở trạng thái enabled
            await strapi.db.query('plugin::users-permissions.permission').update({
              where: { id: existing.id },
              data: { enabled: true },
            });
          }
        }
        strapi.log.info('[Fix] Community API permissions granted to Public role.');
      }
    } catch (err) {
      strapi.log.error('[Fix] Could not set community permissions:', err);
    }

    // 2) Ensure Google provider is enabled if config exists
    const configPath = path.join(process.cwd(), 'google-auth-config.json');
    if (await fs.pathExists(configPath)) {
      try {
        const pluginStore = strapi.store({ type: 'plugin', name: 'users-permissions' });
        const settings = await pluginStore.get({ key: 'grant' }) as any;

        if (settings && settings.google && !settings.google.enabled) {
          strapi.log.info('[Google Auth] Provider is disabled. Enabling it automatically...');
          settings.google.enabled = true;
          // We also need to set the keys if they are not in the database store
          const config = await fs.readJson(configPath);
          settings.google.key = config.clientId;
          settings.google.secret = config.clientSecret;
          settings.google.callback = config.redirectUri;

          await pluginStore.set({ key: 'grant', value: settings });
          strapi.log.info('[Google Auth] Google provider has been enabled and configured.');
        }
      } catch (err) {
        strapi.log.error('[Google Auth] Failed to auto-enable provider:', err);
      }
    }
  },
};

// trigger restart 1772785727423