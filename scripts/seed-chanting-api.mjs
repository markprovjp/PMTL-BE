import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import https from 'node:https';
import { URL } from 'node:url';

const ROOT = process.cwd();
const FRONTEND_ENV_PATH = path.join(ROOT, '..', 'fe-pmtl', '.env.local');
const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

function readEnvVar(filePath, key) {
  if (!fs.existsSync(filePath)) return null;
  const line = fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .find((entry) => entry.startsWith(`${key}=`));
  return line ? line.slice(key.length + 1).trim() : null;
}

const STRAPI_API_TOKEN =
  process.env.STRAPI_API_TOKEN || readEnvVar(FRONTEND_ENV_PATH, 'STRAPI_API_TOKEN');

if (!STRAPI_API_TOKEN) {
  console.error('[seed-chanting-api] Missing STRAPI_API_TOKEN');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${STRAPI_API_TOKEN}`,
  'Content-Type': 'application/json',
};

async function apiRequest(method, endpoint, body) {
  const url = new URL(`${STRAPI_URL}/api${endpoint}`);
  const client = url.protocol === 'https:' ? https : http;
  const payload = body ? JSON.stringify({ data: body }) : null;

  return new Promise((resolve, reject) => {
    const req = client.request(
      {
        method,
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        headers: {
          ...headers,
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        },
        timeout: 30000,
      },
      (res) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          const parsed = raw ? JSON.parse(raw) : {};
          const status = res.statusCode || 500;
          if (status < 200 || status >= 300) {
            const message = parsed?.error?.message || res.statusMessage || 'Request failed';
            reject(new Error(`${method} ${endpoint} -> ${status} ${message}`));
            return;
          }
          resolve(parsed);
        });
      }
    );

    req.on('error', (error) => reject(error));
    req.on('timeout', () => req.destroy(new Error(`Timeout ${method} ${endpoint}`)));
    if (payload) req.write(payload);
    req.end();
  });
}

function esc(value) {
  return encodeURIComponent(value);
}

async function getCollectionFirst(endpoint, query) {
  const data = await apiRequest('GET', `${endpoint}${query ? `?${query}` : ''}`);
  return data?.data?.[0] ?? null;
}

async function upsertBySlug(endpoint, slug, payload) {
  const existing = await getCollectionFirst(
    endpoint,
    `filters[slug][$eq]=${esc(slug)}&pagination[pageSize]=1`
  );

  if (existing?.documentId) {
    await apiRequest('PUT', `${endpoint}/${existing.documentId}`, payload);
    const refreshed = await getCollectionFirst(
      endpoint,
      `filters[slug][$eq]=${esc(slug)}&pagination[pageSize]=1`
    );
    return { mode: 'updated', id: refreshed?.id, documentId: refreshed?.documentId };
  }

  const created = await apiRequest('POST', endpoint, payload);
  return { mode: 'created', id: created?.data?.id, documentId: created?.data?.documentId };
}

async function upsertByTitle(endpoint, title, payload) {
  const existing = await getCollectionFirst(
    endpoint,
    `filters[title][$eq]=${esc(title)}&pagination[pageSize]=1`
  );

  if (existing?.documentId) {
    await apiRequest('PUT', `${endpoint}/${existing.documentId}`, payload);
    const refreshed = await getCollectionFirst(
      endpoint,
      `filters[title][$eq]=${esc(title)}&pagination[pageSize]=1`
    );
    return { mode: 'updated', id: refreshed?.id, documentId: refreshed?.documentId };
  }

  const created = await apiRequest('POST', endpoint, payload);
  return { mode: 'created', id: created?.data?.id, documentId: created?.data?.documentId };
}

async function upsertSingle(endpoint, payload) {
  const existing = await apiRequest('GET', endpoint);
  if (existing?.data?.documentId) {
    await apiRequest('PUT', endpoint, payload);
    return { mode: 'updated', documentId: existing.data.documentId };
  }
  await apiRequest('PUT', endpoint, payload);
  const after = await apiRequest('GET', endpoint);
  return { mode: 'created', documentId: after?.data?.documentId };
}

async function run() {
  const summary = [];

  const chantingSetting = await upsertSingle('/chanting-setting', {
    pageTitle: 'Công khóa niệm kinh hôm nay',
    pageDescription:
      'Chọn bài cần niệm cho hôm nay, theo dõi tiến độ và giữ nhịp hành trì đơn giản, tập trung.',
    guidelinesTitle: 'Những điều cần lưu ý khi niệm kinh',
    guidelinesSummary:
      'Lưu ý ngắn để anh/chị xem lại trước khi bắt đầu: chuẩn bị, phát nguyện, giữ chánh niệm và hồi hướng.',
    guidelineSections: [
      {
        title: 'Chuẩn bị trước thời niệm',
        body: '<p>Giữ thân tâm nhẹ, chọn chỗ yên tĩnh nếu có thể. Nếu đang di chuyển, có thể niệm thầm và vẫn giữ tâm cung kính.</p>',
        order: 1,
      },
      {
        title: 'Bài cốt lõi và bài tùy chọn',
        body: '<p>Bài cốt lõi luôn hiển thị theo lịch trình. Bài tùy chọn có thể bật/tắt trong phần cấu hình cá nhân.</p>',
        order: 2,
      },
      {
        title: 'Lời nguyện cá nhân',
        body: '<p>Với chú cầu an/cầu hóa giải, có thể nhập tên mình, tên đối phương và sở nguyện để dễ hành trì đúng tâm niệm.</p>',
        order: 3,
      },
      {
        title: 'Lưu tiến độ',
        body: '<p>Tiến độ được lưu theo ngày. Khi đăng nhập sẽ đồng bộ theo tài khoản, khi chưa đăng nhập vẫn lưu cục bộ trên thiết bị.</p>',
        order: 4,
      },
    ],
  });
  summary.push(['chanting-setting', chantingSetting.mode]);

  const chantItems = [
    {
      title: 'Phát Nguyện Trước Khi Niệm',
      slug: 'phat-nguyen-truoc-khi-niem',
      kind: 'step',
      content:
        '<p>Con xin nương nơi Tam Bảo, nguyện đem tâm thanh tịnh và lòng tri ân để bắt đầu công khóa hôm nay.</p>',
      openingPrayer:
        '<p>Nguyện cho buổi niệm hôm nay được chánh niệm, đúng pháp, lợi mình lợi người.</p>',
      recommendedPresets: [1],
    },
    {
      title: 'Chú Đại Bi',
      slug: 'chu-dai-bi',
      kind: 'mantra',
      content:
        '<p>Admin có thể cập nhật toàn văn hoặc gắn PDF/ảnh bản kinh. Mặc định hiển thị dạng đọc nhanh để hành trì.</p>',
      openingPrayer:
        '<p>Nguyện nương oai lực Quán Thế Âm Bồ Tát, hộ trì cho con tăng trưởng từ bi, tiêu trừ chướng ngại.</p>',
      recommendedPresets: [7, 21, 49],
    },
    {
      title: 'Lễ Phật Sám Hối Văn',
      slug: 'le-phat-sam-hoi',
      kind: 'sutra',
      content:
        '<p>Đệ tử chúng con từ vô thủy đến nay gây nhiều lỗi lầm, nay chí thành sám hối, nguyện sửa đổi, tinh tấn tu học.</p>',
      openingPrayer:
        '<p>Con xin chí thành sám hối các lỗi lầm thân khẩu ý, nguyện hành thiện và giữ tâm khiêm hạ.</p>',
      recommendedPresets: [1],
    },
    {
      title: 'Niệm Phật A Di Đà',
      slug: 'niem-phat-a-di-da',
      kind: 'mantra',
      content: '<p>Nam mô A Di Đà Phật.</p>',
      openingPrayer:
        '<p>Nguyện nương danh hiệu Đức Phật A Di Đà, nhiếp tâm thanh tịnh, vun bồi tín nguyện.</p>',
      recommendedPresets: [108, 300, 1080],
    },
    {
      title: 'Giải Kết Chú',
      slug: 'giai-ket-chu',
      kind: 'mantra',
      content:
        '<p>Bài chú tùy chọn cho mục tiêu hóa giải xung đột. Người dùng có thể nhập tên mình, tên đối phương và sở nguyện cá nhân.</p>',
      openingPrayer:
        '<p>Thỉnh cầu Quán Thế Âm Bồ Tát gia hộ cho con cùng người hữu duyên hóa giải bất hòa, tăng trưởng thiện duyên.</p>',
      recommendedPresets: [21, 27, 49],
    },
    {
      title: 'Tiêu Tai Cát Tường Thần Chú',
      slug: 'tieu-tai-cat-tuong-than-chu',
      kind: 'mantra',
      content:
        '<p>Bài chú tùy chọn cầu bình an, thuận lợi. Có thể tùy chỉnh số biến trong phạm vi quản trị cho phép.</p>',
      openingPrayer:
        '<p>Thỉnh cầu Quán Thế Âm Bồ Tát gia hộ cho con tiêu tai cát tường, thân tâm bình an, mọi việc thuận chánh pháp.</p>',
      recommendedPresets: [21, 27, 49],
    },
    {
      title: 'Chuẩn Đề Thần Chú',
      slug: 'chuan-de-than-chu',
      kind: 'mantra',
      content:
        '<p>Bài chú tùy chọn hỗ trợ sở nguyện thiện lành. Admin có thể gắn bản kinh PDF/ảnh để người dùng xem nhanh.</p>',
      openingPrayer:
        '<p>Nguyện cho con tâm tưởng sự thành trên nền tảng thiện nghiệp, không trái chánh pháp.</p>',
      recommendedPresets: [21, 27, 49],
    },
    {
      title: 'Bài Hồi Hướng Ngắn',
      slug: 'hoi-huong-ngan',
      kind: 'step',
      content:
        '<p>Nguyện đem công đức này hướng về khắp tất cả, đệ tử và chúng sinh đều trọn thành Phật đạo.</p>',
      openingPrayer:
        '<p>Con xin hồi hướng công đức niệm tụng hôm nay đến pháp giới chúng sinh đều được an lành.</p>',
      recommendedPresets: [1],
    },
  ];

  const itemMap = {};
  for (const item of chantItems) {
    const result = await upsertBySlug('/chant-items', item.slug, item);
    itemMap[item.slug] = { id: result.id, documentId: result.documentId };
    summary.push([`chant-item:${item.slug}`, result.mode]);
  }

  const planItemsById = [
    { item: itemMap['phat-nguyen-truoc-khi-niem'].id, order: 1, targetDefault: 1, targetMin: 1, targetMax: 1, isOptional: false },
    { item: itemMap['chu-dai-bi'].id, order: 2, targetDefault: 7, targetMin: 7, targetMax: 49, isOptional: false },
    { item: itemMap['le-phat-sam-hoi'].id, order: 3, targetDefault: 1, targetMin: 1, targetMax: 1, isOptional: false },
    { item: itemMap['niem-phat-a-di-da'].id, order: 4, targetDefault: 108, targetMin: 21, targetMax: 1080, isOptional: false },
    { item: itemMap['giai-ket-chu'].id, order: 5, targetDefault: 21, targetMin: 21, targetMax: 49, isOptional: true },
    { item: itemMap['tieu-tai-cat-tuong-than-chu'].id, order: 6, targetDefault: 21, targetMin: 21, targetMax: 49, isOptional: true },
    { item: itemMap['chuan-de-than-chu'].id, order: 7, targetDefault: 21, targetMin: 21, targetMax: 49, isOptional: true },
    { item: itemMap['hoi-huong-ngan'].id, order: 8, targetDefault: 1, targetMin: 1, targetMax: 1, isOptional: false },
  ];

  const dailyPlanPayload = {
    title: 'Công Khóa Cơ Bản Hằng Ngày',
    slug: 'daily-basic',
    planType: 'daily',
    planItems: planItemsById,
  };

  let dailyPlan = await upsertBySlug('/chant-plans', 'daily-basic', dailyPlanPayload);
  summary.push(['chant-plan:daily-basic', dailyPlan.mode]);

  const viaPlanPayload = {
    title: 'Thời Khóa Ngày Vía Phật A Di Đà',
    slug: 'via-phat-a-di-da',
    planType: 'special',
    planItems: [
      { item: itemMap['chu-dai-bi'].id, order: 1, targetDefault: 21, targetMin: 7, targetMax: 49, isOptional: false },
      { item: itemMap['niem-phat-a-di-da'].id, order: 2, targetDefault: 3000, targetMin: 1000, targetMax: 10000, isOptional: false },
      { item: itemMap['hoi-huong-ngan'].id, order: 3, targetDefault: 1, targetMin: 1, targetMax: 1, isOptional: false },
    ],
  };

  const viaPlan = await upsertBySlug('/chant-plans', 'via-phat-a-di-da', viaPlanPayload);
  summary.push(['chant-plan:via-phat-a-di-da', viaPlan.mode]);

  const lunarEvents = [
    {
      title: 'Rằm Hàng Tháng',
      isRecurringLunar: true,
      lunarMonth: 1,
      lunarDay: 15,
      eventType: 'fast',
    },
    {
      title: 'Ngày Vía Phật A Di Đà',
      isRecurringLunar: true,
      lunarMonth: 11,
      lunarDay: 17,
      eventType: 'buddha',
    },
  ];

  const lunarMap = {};
  for (const event of lunarEvents) {
    const result = await upsertByTitle('/lunar-events', event.title, event);
    lunarMap[event.title] = { id: result.id, documentId: result.documentId };
    summary.push([`lunar-event:${event.title}`, result.mode]);
  }

  async function upsertOverride(note, payload) {
    const existing = await getCollectionFirst(
      '/lunar-event-chant-overrides',
      `filters[note][$eq]=${esc(note)}&pagination[pageSize]=1`
    );
    if (existing?.documentId) {
      await apiRequest('PUT', `/lunar-event-chant-overrides/${existing.documentId}`, payload);
      return { mode: 'updated', documentId: existing.documentId };
    }
    const created = await apiRequest('POST', '/lunar-event-chant-overrides', payload);
    return { mode: 'created', documentId: created?.data?.documentId };
  }

  const override1 = await upsertOverride('Khuyến khích tụng Chú Đại Bi vào ngày rằm.', {
    lunarEvent: lunarMap['Rằm Hàng Tháng'].id,
    item: itemMap['chu-dai-bi'].id,
    mode: 'enable',
    priority: 2,
    note: 'Khuyến khích tụng Chú Đại Bi vào ngày rằm.',
  });
  summary.push(['lunar-event-chant-override:enable-chu-dai-bi', override1.mode]);

  const override2 = await upsertOverride('Giới hạn tối đa niệm Phật cho người mới vào ngày rằm.', {
    lunarEvent: lunarMap['Rằm Hàng Tháng'].id,
    item: itemMap['niem-phat-a-di-da'].id,
    mode: 'cap_max',
    max: 5000,
    priority: 3,
    note: 'Giới hạn tối đa niệm Phật cho người mới vào ngày rằm.',
  });
  summary.push(['lunar-event-chant-override:cap-adida', override2.mode]);

  const userList = await apiRequest('GET', '/users?pagination[pageSize]=1&sort=id:asc');
  const firstUser = Array.isArray(userList) ? userList[0] : null;
  if (!firstUser?.id) {
    throw new Error('No user found. Need at least one user to seed chant-preference/practice-log.');
  }

  const dailyPlanRecord = await getCollectionFirst(
    '/chant-plans',
    `filters[slug][$eq]=daily-basic&pagination[pageSize]=1`
  );
  if (!dailyPlanRecord?.documentId) {
    throw new Error('daily-basic plan not found after upsert');
  }

  const preferenceFilter = `filters[user][id][$eq]=${firstUser.id}&filters[plan][id][$eq]=${dailyPlanRecord.id}&pagination[pageSize]=1`;
  const existingPreference = await getCollectionFirst('/chant-preferences', preferenceFilter);
  const preferencePayload = {
    user: firstUser.id,
    plan: dailyPlanRecord.id,
    templateConfig: {
      enabledOptionalSlugs: ['giai-ket-chu', 'tieu-tai-cat-tuong-than-chu'],
      targetsBySlug: {
        'chu-dai-bi': 21,
        'niem-phat-a-di-da': 300,
        'giai-ket-chu': 27,
        'tieu-tai-cat-tuong-than-chu': 21,
      },
      intentionsBySlug: {
        'giai-ket-chu': {
          selfName: 'Phật tử',
          counterpartName: 'Người hữu duyên',
          wish: 'Hóa giải bất hòa, tăng trưởng thiện duyên',
        },
      },
    },
  };
  if (existingPreference?.documentId) {
    await apiRequest('PUT', `/chant-preferences/${existingPreference.documentId}`, preferencePayload);
    summary.push(['chant-preference', 'updated']);
  } else {
    await apiRequest('POST', '/chant-preferences', preferencePayload);
    summary.push(['chant-preference', 'created']);
  }

  const today = new Date().toISOString().slice(0, 10);
  const practiceFilter = `filters[user][id][$eq]=${firstUser.id}&filters[date][$eq]=${today}&pagination[pageSize]=1`;
  const existingPractice = await getCollectionFirst('/practice-logs', practiceFilter);
  const practicePayload = {
    user: firstUser.id,
    plan: dailyPlanRecord.id,
    date: today,
    isCompleted: false,
    itemsProgress: {
      'phat-nguyen-truoc-khi-niem': { count: 1, done: true },
      'chu-dai-bi': { count: 7, done: true },
      'niem-phat-a-di-da': { count: 108, done: false },
      'hoi-huong-ngan': { count: 0, done: false },
    },
    sessionConfig: {
      enabledOptionalSlugs: ['giai-ket-chu'],
      targetsBySlug: { 'giai-ket-chu': 27 },
      intentionsBySlug: {
        'giai-ket-chu': {
          selfName: 'Phật tử',
          counterpartName: 'Người hữu duyên',
          wish: 'Giữ tâm hòa ái và hóa giải xung đột',
        },
      },
    },
  };
  if (existingPractice?.documentId) {
    await apiRequest('PUT', `/practice-logs/${existingPractice.documentId}`, practicePayload);
    summary.push(['practice-log', 'updated']);
  } else {
    await apiRequest('POST', '/practice-logs', practicePayload);
    summary.push(['practice-log', 'created']);
  }

  console.log('[seed-chanting-api] done');
  for (const [name, mode] of summary) {
    console.log(`- ${name}: ${mode}`);
  }
}

run().catch((error) => {
  console.error('[seed-chanting-api] failed:', error?.message || error);
  process.exit(1);
});
