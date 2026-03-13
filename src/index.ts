import type { Core } from '@strapi/strapi';
import fs from 'fs-extra';
import path from 'path';
import {
  BLOG_POST_MEILISEARCH_INDEX,
  BLOG_POST_MEILISEARCH_SETTINGS,
} from './search/blog-post-search';
import { persistAuditTrail, shouldTrackAudit } from './services/audit-trail';
import { registerPushDispatchWorker } from './services/push-queue';
import { cleanupExpiredGuards } from './services/request-guard';

function clonePlain<T>(value: T): T | null {
  if (!value) return null;
  return JSON.parse(JSON.stringify(value)) as T;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function resolveLifecycleAction(
  action: 'create' | 'update' | 'delete',
  beforeValue: Record<string, unknown> | null,
  afterValue: Record<string, unknown> | null
): 'create' | 'update' | 'delete' | 'publish' | 'unpublish' {
  if (action === 'create') {
    return afterValue?.publishedAt ? 'publish' : 'create';
  }

  if (action === 'delete') {
    return 'delete';
  }

  const beforePublished = Boolean(beforeValue?.publishedAt);
  const afterPublished = Boolean(afterValue?.publishedAt);

  if (!beforePublished && afterPublished) {
    return 'publish';
  }

  if (beforePublished && !afterPublished) {
    return 'unpublish';
  }

  return 'update';
}

async function fetchLifecycleEntry(
  strapi: Core.Strapi,
  uid: string,
  id: number | string | undefined
) {
  if (id === undefined || id === null) return null;

  try {
    return await strapi.db.query(uid as any).findOne({
      where: { id },
    });
  } catch (error) {
    strapi.log.warn(`[Audit Trail] Failed to fetch snapshot for ${uid}#${id}`, error);
    return null;
  }
}

export function getTrackedAuditModelUids(strapi: Core.Strapi) {
  return Object.keys(strapi.contentTypes ?? {}).filter(shouldTrackAudit);
}

function registerAuditLifecycleSubscribers(strapi: Core.Strapi) {
  const trackedModels = getTrackedAuditModelUids(strapi);

  strapi.db.lifecycles.subscribe({
    models: trackedModels,

    async beforeCreate(event) {
      if (!shouldTrackAudit(event.model.uid)) return;
      event.state = {
        ...(event.state ?? {}),
        beforeValue: null,
      };
    },

    async beforeUpdate(event) {
      if (!shouldTrackAudit(event.model.uid)) return;

      const whereId = event.params?.where?.id;
      const beforeValue = await fetchLifecycleEntry(strapi, event.model.uid, whereId);
      event.state = {
        ...(event.state ?? {}),
        beforeValue: clonePlain(beforeValue),
      };
    },

    async beforeDelete(event) {
      if (!shouldTrackAudit(event.model.uid)) return;

      const whereId = event.params?.where?.id;
      const beforeValue = await fetchLifecycleEntry(strapi, event.model.uid, whereId);
      event.state = {
        ...(event.state ?? {}),
        beforeValue: clonePlain(beforeValue),
      };
    },

    async afterCreate(event) {
      if (!shouldTrackAudit(event.model.uid)) return;

      await persistAuditTrail(strapi, {
        uid: event.model.uid,
        action: resolveLifecycleAction('create', null, clonePlain(event.result)),
        before: null,
        after: clonePlain(event.result),
      });
    },

    async afterUpdate(event) {
      if (!shouldTrackAudit(event.model.uid)) return;

      const beforeValue = asRecord(clonePlain(event.state?.beforeValue));
      const afterValue = asRecord(clonePlain(event.result));

      await persistAuditTrail(strapi, {
        uid: event.model.uid,
        action: resolveLifecycleAction('update', beforeValue, afterValue),
        before: beforeValue,
        after: afterValue,
      });
    },

    async afterDelete(event) {
      if (!shouldTrackAudit(event.model.uid)) return;

      await persistAuditTrail(strapi, {
        uid: event.model.uid,
        action: 'delete',
        before: asRecord(clonePlain(event.state?.beforeValue)),
        after: null,
      });
    },
  });

  strapi.log.info(`[Audit Trail] Registered lifecycle subscribers for ${trackedModels.length} models.`);
}

async function configureMeilisearchBlogIndex(strapi: Core.Strapi) {
  const host = process.env.MEILISEARCH_HOST;
  const apiKey = process.env.MEILISEARCH_API_KEY;
  const isEnabled = process.env.MEILISEARCH_ENABLED !== 'false' && Boolean(host);

  if (!isEnabled || !host) {
    return;
  }

  const indexName = process.env.MEILISEARCH_BLOG_POST_INDEX || BLOG_POST_MEILISEARCH_INDEX;
  const settingsUrl = `${host.replace(/\/$/, '')}/indexes/${indexName}/settings`;

  try {
    const response = await fetch(settingsUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify(BLOG_POST_MEILISEARCH_SETTINGS),
    });

    if (!response.ok) {
      const body = await response.text();
      strapi.log.warn(`[Meilisearch] Could not apply index settings for ${indexName}: ${response.status} ${body}`);
      return;
    }

    strapi.log.info(`[Meilisearch] Applied production settings to index ${indexName}.`);
  } catch (error) {
    strapi.log.warn('[Meilisearch] Failed to configure blog index settings:', error);
  }
}

async function configureStrapiCalendarDefaults(strapi: Core.Strapi) {
  if (!strapi.plugin('strapi-calendar')) {
    return;
  }

  const pluginStore = strapi.store({
    environment: '',
    type: 'plugin',
    name: 'strapi-calendar',
  });

  const currentSettings = (await pluginStore.get({ key: 'settings' })) as Record<string, unknown> | null;

  if (currentSettings?.collection === 'api::event.event' && currentSettings?.startField === 'date') {
    return;
  }

  await pluginStore.set({
    key: 'settings',
    value: {
      collection: 'api::event.event',
      titleField: 'title',
      startField: 'date',
      endField: null,
      colorField: null,
      defaultDuration: 120,
      drafts: true,
      startHour: '6:00',
      endHour: '21:00',
      defaultView: 'Month',
      monthView: true,
      weekView: true,
      workWeekView: false,
      dayView: true,
      todayButton: true,
      createButton: true,
      primaryColor: '#a16207',
      eventColor: '#d97706',
    },
  });

  strapi.log.info('[Calendar] Default calendar settings mapped to api::event.event/date.');
}

async function logQueueOperationalWarnings(strapi: Core.Strapi) {
  const redisEnabled = process.env.REDIS_ENABLED !== 'false' && Boolean(process.env.REDIS_HOST);
  const bullmqEnabled = process.env.BULLMQ_ENABLED !== 'false' && redisEnabled;
  const workerSecret = process.env.PUSH_WORKER_SECRET || process.env.PUSH_SEND_SECRET;
  const frontendUrl = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_SITE_URL;
  const processUrl = process.env.PUSH_PROCESS_URL;

  if (!redisEnabled || !bullmqEnabled) {
    strapi.log.warn('[Push Queue] Redis/BullMQ is disabled. New push-jobs will remain pending until queue is enabled.');
    return;
  }

  if (!workerSecret) {
    strapi.log.warn('[Push Queue] Missing PUSH_WORKER_SECRET (or PUSH_SEND_SECRET fallback). Worker cannot authenticate to /api/push/process.');
  }

  if (!frontendUrl && !processUrl) {
    strapi.log.warn('[Push Queue] Missing FRONTEND_URL or PUSH_PROCESS_URL. Worker does not know where to send push processing requests.');
  }
}

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

    // ─── 3) Auto-generate TypeScript Types ────────────────────────
    try {
      const generatedDir = path.join(process.cwd(), 'types', 'generated');
      await fs.ensureDir(generatedDir);

      const strapiTypeToTS = (fieldType: string, field: any): string => {
        switch (fieldType) {
          case 'string': case 'text': case 'richtext': case 'date': case 'datetime': case 'time': return 'string';
          case 'integer': case 'biginteger': case 'decimal': case 'float': return 'number';
          case 'boolean': return 'boolean';
          case 'json': return 'Record<string, any>';
          case 'media': return 'StrapiMediaRef | null';
          case 'component': return field.repeatable ? 'any[]' : 'any';
          case 'relation': {
            const relation = field.relation || '';
            const target = field.target || '';

            if (target.startsWith('admin::')) return 'any';
            if (target.startsWith('plugin::')) return 'any';
            if (relation.includes('morph')) return 'any';

            const modelName = target.split('.').pop() || '';
            const targetType = modelName.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join('');

            const isMany = relation.includes('Many') || relation === 'manyWay' || relation === 'morphToMany';

            return targetType ? (isMany ? `${targetType}[]` : `${targetType} | null`) : 'any';
          }
          default: return 'unknown';
        }
      };

      const generateContentTypeInterface = (uid: string, schema: any): string => {
        const modelName = uid.split('.').pop() || '';
        const typeName = modelName.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join('') || 'Unknown';
        const fields: string[] = ['id?: number;', 'documentId: string;', 'createdAt: string;', 'updatedAt: string;'];

        for (const [key, field] of Object.entries(schema.attributes || {})) {
          if (['id', 'documentId', 'createdAt', 'updatedAt'].includes(key)) continue;
          const fieldDef = field as any;
          const tsType = strapiTypeToTS(fieldDef.type, fieldDef);
          const optional = !fieldDef.required ? '?' : '';
          const safeKey = key.includes('-') ? `'${key}'` : key;
          fields.push(`${safeKey}${optional}: ${tsType};`);
        }
        return `export interface ${typeName} {\n  ${fields.join('\n  ')}\n}`;
      };

      const contentTypes = strapi.contentTypes;
      const interfaces: string[] = [
        '/**\n * AUTO-GENERATED TYPE DEFINITIONS\n * Do not edit manually!\n * Regenerate: npm run build\n */\n',
        "import type { StrapiMediaRef } from './media'\n",
      ];

      for (const [uid, schema] of Object.entries(contentTypes)) {
        if (uid.startsWith('admin::') || uid.startsWith('plugin::')) continue;
        try {
          interfaces.push(generateContentTypeInterface(uid, schema));
          interfaces.push('');
        } catch (err) {
          strapi.log.warn(`[TypeScript] Skipped ${uid}:`, err);
        }
      }

      const outputPath = path.join(generatedDir, 'content-types.ts');
      await fs.writeFile(outputPath, interfaces.join('\n'), 'utf-8');
      strapi.log.info(`[TypeScript] Generated custom types → ${outputPath}`);
    } catch (err) {
      strapi.log.error('[TypeScript] Generation failed:', err);
    }

    registerAuditLifecycleSubscribers(strapi);

    try {
      const deletedGuards = await cleanupExpiredGuards(strapi, 500);
      if (deletedGuards > 0) {
        strapi.log.info(`[Request Guard] Cleaned up ${deletedGuards} expired rows.`);
      }
    } catch (err) {
      strapi.log.warn('[Request Guard] Cleanup failed during bootstrap:', err);
    }

    await configureMeilisearchBlogIndex(strapi);
    await configureStrapiCalendarDefaults(strapi);
    await logQueueOperationalWarnings(strapi);
    registerPushDispatchWorker(strapi);
  },
};

// trigger restart 1772785727423
