import type { Core } from '@strapi/strapi';

const PUSH_DISPATCH_QUEUE = 'push-dispatch';
const PUSH_DISPATCH_JOB = 'dispatch-push-job';

function hasQueuePlugins(strapi: Core.Strapi) {
  return Boolean(strapi.plugins?.bullmq && strapi.plugins?.redis);
}

function resolveProcessUrl() {
  const explicitUrl = process.env.PUSH_PROCESS_URL;
  if (explicitUrl) {
    return explicitUrl;
  }

  const frontendUrl = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (!frontendUrl) {
    return null;
  }

  return `${frontendUrl.replace(/\/$/, '')}/api/push/process`;
}

export async function enqueuePushDispatch(strapi: Core.Strapi, jobDocumentId: string) {
  if (!jobDocumentId || !hasQueuePlugins(strapi)) {
    return false;
  }

  try {
    const queue = strapi.plugin('bullmq').service('queue').get(PUSH_DISPATCH_QUEUE);
    await queue.add(
      PUSH_DISPATCH_JOB,
      { jobDocumentId },
      {
        jobId: `push-dispatch:${jobDocumentId}`,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5_000,
        },
        removeOnComplete: 100,
        removeOnFail: 100,
      }
    );

    return true;
  } catch (error) {
    strapi.log.warn('[Push Queue] Failed to enqueue dispatch job', error);
    return false;
  }
}

export function registerPushDispatchWorker(strapi: Core.Strapi) {
  if (!hasQueuePlugins(strapi)) {
    strapi.log.info('[Push Queue] Redis/BullMQ not enabled. Skipping worker bootstrap.');
    return false;
  }

  const processUrl = resolveProcessUrl();
  const secret = process.env.PUSH_WORKER_SECRET || process.env.PUSH_SEND_SECRET;

  if (!processUrl || !secret) {
    strapi.log.warn('[Push Queue] Missing PUSH_PROCESS_URL/FRONTEND_URL or PUSH_WORKER_SECRET. Worker not started.');
    return false;
  }

  try {
    const queue = strapi.plugin('bullmq').service('queue').get(PUSH_DISPATCH_QUEUE);
    const worker = strapi.plugin('bullmq').service('worker').create(
      queue,
      async (job: { data?: { jobDocumentId?: string } }) => {
        const response = await fetch(processUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${secret}`,
          },
        });

        if (!response.ok) {
          const body = await response.text().catch(() => '');
          throw new Error(`Push process request failed: ${response.status} ${body}`.trim());
        }

        return {
          queuedDocumentId: job.data?.jobDocumentId ?? null,
        };
      },
      {
        concurrency: 1,
      }
    );

    worker.on('failed', (job, error) => {
      strapi.log.error(
        `[Push Queue] Worker failed for ${job?.data?.jobDocumentId ?? 'unknown-job'}: ${error.message}`
      );
    });

    strapi.log.info(`[Push Queue] Worker listening on queue "${PUSH_DISPATCH_QUEUE}".`);
    return true;
  } catch (error) {
    strapi.log.error('[Push Queue] Failed to start worker', error);
    return false;
  }
}
