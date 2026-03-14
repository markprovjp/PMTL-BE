import fs from 'node:fs/promises';
import path from 'node:path';

function parseEnv(content) {
  const values = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIndex = line.indexOf('=');
    if (eqIndex <= 0) continue;
    const key = line.slice(0, eqIndex).trim();
    const value = line.slice(eqIndex + 1).trim();
    values[key] = value;
  }

  return values;
}

async function loadEnvFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return parseEnv(content);
  } catch {
    return {};
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.headers || {}),
    },
  });

  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => '');

  return { response, body };
}

async function wait(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const beEnv = await loadEnvFile(path.join(process.cwd(), '.env'));
  const feEnv = await loadEnvFile(path.join(process.cwd(), '..', 'fe-pmtl', '.env.local'));

  const strapiUrl = beEnv.PUBLIC_URL || 'http://127.0.0.1:1337';
  const frontendUrl = beEnv.FRONTEND_URL || feEnv.NEXT_PUBLIC_SITE_URL || 'http://127.0.0.1:3000';
  const strapiToken = feEnv.STRAPI_API_TOKEN || '';
  const pushSecret = feEnv.PUSH_WORKER_SECRET || feEnv.PUSH_SEND_SECRET || beEnv.PUSH_WORKER_SECRET || '';

  assert(strapiToken, 'Missing STRAPI_API_TOKEN in fe-pmtl/.env.local');
  assert(pushSecret, 'Missing PUSH_WORKER_SECRET/PUSH_SEND_SECRET');

  const report = [];

  const admin = await requestJson(`${strapiUrl}/admin`);
  assert(admin.response.ok, `Strapi admin unavailable: ${admin.response.status}`);
  report.push('admin ok');

  const posts = await requestJson(`${strapiUrl}/api/blog-posts?pagination[pageSize]=1&fields[0]=documentId&fields[1]=uuid&fields[2]=slug`);
  assert(posts.response.ok, `blog-post list failed: ${posts.response.status}`);
  const firstPost = posts.body?.data?.[0];
  assert(firstPost?.documentId && firstPost?.uuid, 'No published blog post found for smoke test');
  report.push('blog-post list ok');

  const viewByDoc = await requestJson(`${strapiUrl}/api/blog-posts/${firstPost.documentId}/view`, { method: 'POST' });
  assert(viewByDoc.response.ok && viewByDoc.body?.ok === true, 'blog-post view by documentId failed');
  const viewByUuid = await requestJson(`${strapiUrl}/api/blog-posts/${firstPost.uuid}/view`, { method: 'POST' });
  assert(viewByUuid.response.ok && viewByUuid.body?.ok === true, 'blog-post view by uuid failed');
  report.push('blog-post view ok');

  const categoryTree = await requestJson(`${strapiUrl}/api/categories/tree`);
  assert(categoryTree.response.ok, `category tree failed: ${categoryTree.response.status}`);
  report.push('category tree ok');

  const authBody = JSON.stringify({ identifier: 'nobody@example.com', password: 'badpass' });
  let rateLimited = false;
  for (let attempt = 1; attempt <= 12; attempt += 1) {
    const auth = await requestJson(`${strapiUrl}/api/auth/local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: authBody,
    });

    if (attempt < 11) {
      assert(auth.response.status === 400, `auth probe attempt ${attempt} expected 400, got ${auth.response.status}`);
    }

    if (auth.response.status === 429) {
      rateLimited = true;
      break;
    }
  }
  assert(rateLimited, 'rate-limit did not trigger on auth/local');
  report.push('rate-limit ok');

  const meiliHealth = await requestJson(`${beEnv.MEILISEARCH_HOST || 'http://127.0.0.1:7700'}/health`, {
    headers: beEnv.MEILISEARCH_API_KEY ? { Authorization: `Bearer ${beEnv.MEILISEARCH_API_KEY}` } : {},
  });
  assert(meiliHealth.response.ok, `Meilisearch health failed: ${meiliHealth.response.status}`);
  report.push('meilisearch health ok');

  const processCheck = await requestJson(`${frontendUrl}/api/push/process`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${pushSecret}` },
  });
  assert(processCheck.response.ok, `push/process auth failed: ${processCheck.response.status}`);
  report.push('push/process auth ok');

  const unique = Date.now().toString(36);
  const fakeEndpoint = `https://example.com/push/smoke-${unique}`;
  const subscriptionBody = JSON.stringify({
    endpoint: fakeEndpoint,
    p256dh: `BOrFakeP256dhKey-${unique}`,
    auth: `fakeAuthKey-${unique}`,
    notificationTypes: ['community'],
    timezone: 'Asia/Ho_Chi_Minh',
    isActive: true,
  });

  const upsert = await requestJson(`${strapiUrl}/api/push-subscriptions/upsert`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${strapiToken}`,
      'Content-Type': 'application/json',
    },
    body: subscriptionBody,
  });
  assert(upsert.response.ok, `push subscription upsert failed: ${upsert.response.status}`);

  const pushJobBody = JSON.stringify({
    data: {
      kind: 'community',
      status: 'pending',
      title: 'Smoke queue test',
      body: 'BullMQ + FE push/process smoke test',
      url: '/community',
      tag: `smoke-${unique}`,
      payload: {},
      chunkSize: 10,
      cursor: 0,
      targetedCount: 0,
      processedCount: 0,
      successCount: 0,
      failedCount: 0,
      invalidCount: 0,
      lastError: null,
      startedAt: null,
      finishedAt: null,
    },
  });

  const createdJob = await requestJson(`${strapiUrl}/api/push-jobs`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${strapiToken}`,
      'Content-Type': 'application/json',
    },
    body: pushJobBody,
  });
  assert(createdJob.response.status === 201, `push job create failed: ${createdJob.response.status}`);

  const targetJobId = createdJob.body?.data?.documentId;
  assert(targetJobId, 'push job create missing documentId');

  for (let round = 0; round < 6; round += 1) {
    await requestJson(`${frontendUrl}/api/push/process`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${pushSecret}` },
    });
    await wait(500);
  }

  const jobState = await requestJson(`${strapiUrl}/api/push-jobs/${targetJobId}`, {
    headers: { Authorization: `Bearer ${strapiToken}` },
  });
  assert(jobState.response.ok, `push job fetch failed: ${jobState.response.status}`);

  const job = jobState.body?.data;
  assert(job?.status === 'completed', `push job not completed, got ${job?.status ?? 'unknown'}`);
  assert(Number(job?.processedCount ?? 0) >= 1, 'push job processedCount did not advance');
  report.push('queue e2e ok');

  const subscriptionState = await requestJson(
    `${strapiUrl}/api/push-subscriptions?filters[endpoint][$eq]=${encodeURIComponent(fakeEndpoint)}&pagination[limit]=1`,
    { headers: { Authorization: `Bearer ${strapiToken}` } }
  );
  const subscription = subscriptionState.body?.data?.[0];
  assert(subscription, 'smoke subscription not found after processing');
  report.push('push subscription state ok');

  console.log('SMOKE OK');
  for (const item of report) {
    console.log(`- ${item}`);
  }
}

main().catch((error) => {
  console.error('SMOKE FAILED');
  console.error(error?.stack || error);
  process.exit(1);
});
