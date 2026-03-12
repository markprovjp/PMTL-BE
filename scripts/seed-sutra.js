/**
 * Seed Sutra sample data (Strapi v5)
 * Usage: node scripts/seed-sutra.js
 */
const path = require('path');
const strapiFactory = require('@strapi/strapi');

async function seedSutra() {
  const appDir = process.cwd();
  const strapi = await strapiFactory.createStrapi({
    appDir,
    distDir: path.join(appDir, 'dist'),
  }).load();

  const summary = { created: 0, updated: 0, failed: 0 };

  async function upsert(uid, uniqueCriteria, data) {
    try {
      const ct = strapi.contentType(uid);
      const hasDP = ct.options.draftAndPublish !== false;
      const existing = await strapi.db.query(uid).findOne({ where: uniqueCriteria });

      const cleanData = { ...data };
      const mapItem = (item) => (item && typeof item === 'object') ? (item.id || item.documentId) : item;
      for (const key in cleanData) {
        if (Array.isArray(cleanData[key])) {
          cleanData[key] = cleanData[key].map(mapItem);
        } else {
          cleanData[key] = mapItem(cleanData[key]);
        }
      }

      let result;
      if (existing) {
        await strapi.db.query(uid).update({ where: { id: existing.id }, data: cleanData });
        if (hasDP) await strapi.db.query(uid).update({ where: { id: existing.id }, data: { published_at: new Date() } });
        result = await strapi.db.query(uid).findOne({ where: { id: existing.id } });
        summary.updated++;
        console.log(`[UPDATE] ${uid}: ${Object.values(uniqueCriteria)[0]}`);
      } else {
        result = await strapi.db.query(uid).create({ data: cleanData });
        if (hasDP) await strapi.db.query(uid).update({ where: { id: result.id }, data: { published_at: new Date() } });
        summary.created++;
        console.log(`[CREATE] ${uid}: ${Object.values(uniqueCriteria)[0]}`);
      }
      return result;
    } catch (err) {
      console.error(`[FAIL] ${uid}:`, err.message);
      summary.failed++;
      return null;
    }
  }

  try {
    console.log('\n--- Seed Sutra: Kinh Dai Bat Nha Ba La Mat Da ---');

    const tagSutra = await upsert('api::blog-tag.blog-tag', { slug: 'kinh-bat-nha' }, {
      name: 'KINH BAT NHA',
      slug: 'kinh-bat-nha',
      description: 'Kinh Dai Bat Nha Ba La Mat Da',
    });
    const tagDaiThua = await upsert('api::blog-tag.blog-tag', { slug: 'dai-thua' }, {
      name: 'DAI THUA',
      slug: 'dai-thua',
      description: 'Kinh dien Dai Thua',
    });

    const sutra = await upsert('api::sutra.sutra', { slug: 'kinh-dai-bat-nha-ba-la-mat-da' }, {
      title: 'Kinh Dai Bat Nha Ba La Mat Da',
      slug: 'kinh-dai-bat-nha-ba-la-mat-da',
      description: 'Tap 01 (tu quyen 01 den quyen 25).',
      shortExcerpt: 'Bo kinh lon ve Bat Nha Ba La Mat Da, gom nhieu quyen va pham.',
      translatorHan: 'Tam Tang Phap Su Huyen Trang',
      translatorViet: 'Hoa Thuong Thich Tri Nghiem',
      reviewer: 'Hoa Thuong Thich Quang Do',
      tags: [tagSutra, tagDaiThua].filter(Boolean),
      isFeatured: true,
      sortOrder: 1,
    });

    if (!sutra) throw new Error('Failed to create sutra');

    const volume1 = await upsert('api::sutra-volume.sutra-volume', { slug: 'tap-01' }, {
      title: 'Tap 01',
      slug: 'tap-01',
      volumeNumber: 1,
      bookStart: 1,
      bookEnd: 25,
      description: 'Tap dau cua bo kinh Dai Bat Nha.',
      sutra,
      sortOrder: 1,
    });

    if (!volume1) throw new Error('Failed to create volume');

    const chapter1 = await upsert('api::sutra-chapter.sutra-chapter', { slug: 'hoi-dau-phan-dau-pham-duyen-khoi' }, {
      title: 'Hoi Dau - Phan Dau - Pham Duyen Khoi 01',
      slug: 'hoi-dau-phan-dau-pham-duyen-khoi',
      chapterNumber: 1,
      openingText: 'QUYEN 1\nHOI DAU\nPHAN DAU\nI. PHAM DUYEN KHOI 01',
      content:
        'Toi nghe nhu vay: Mot thoi no, Phat o tren dinh nui Thu Phong (1). ' +
        'Chung hoi dong tu tap dong du. O do co nhieu vi dai Bo Tat (2). ' +
        '[[Huu Dinh]] la co troi cao nhat trong tam gioi.',
      endingText: 'Pham Duyen Khoi ket thuc o day.',
      estimatedReadMinutes: 6,
      sutra,
      volume: volume1,
      sortOrder: 1,
    });

    if (!chapter1) throw new Error('Failed to create chapter');

    await upsert('api::sutra-glossary.sutra-glossary', { markerKey: '1', chapter: chapter1.id }, {
      markerKey: '1',
      term: 'Rung cay Ta-La',
      meaning: 'Rung cay Ta-La (Sa-La), noi Phat ngu. Bon phia co tan cay Ta-La chia lam bon cap nen goi la Ta-La Song-Tho Cau-Thi-Na.',
      sutra,
      volume: volume1,
      chapter: chapter1,
      sortOrder: 1,
    });

    await upsert('api::sutra-glossary.sutra-glossary', { markerKey: '2', chapter: chapter1.id }, {
      markerKey: '2',
      term: 'Bo Tat',
      meaning: 'Bo Tat la nhung vi phat tu thuc hanh hanh Bo Tat, phat tam vi loi ich chung sinh.',
      sutra,
      volume: volume1,
      chapter: chapter1,
      sortOrder: 2,
    });

    await upsert('api::sutra-glossary.sutra-glossary', { markerKey: 'huu-dinh', chapter: chapter1.id }, {
      markerKey: 'huu-dinh',
      term: 'Huu Dinh',
      meaning: 'Huu Dinh goi du la Tam huu chi dinh – Coi troi cao nhat trong tam gioi, tuc Sac Cuu-Canh-Thien.',
      sutra,
      volume: volume1,
      chapter: chapter1,
      sortOrder: 3,
    });

    console.log('\n--- Seed completed ---');
    console.log(summary);
  } catch (err) {
    console.error('Seed failed:', err.message || err);
  } finally {
    await strapi.destroy();
  }
}

seedSutra();
