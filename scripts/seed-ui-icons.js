/**
 * Seed shared UI icons for admin relation fields.
 * Run: node scripts/seed-ui-icons.js
 */

const path = require('path');
const strapiFactory = require('@strapi/strapi');

const ICONS = [
  { name: 'Book', key: 'book', lucideName: 'BookOpen', category: 'content' },
  { name: 'Search', key: 'search', lucideName: 'Search', category: 'navigation' },
  { name: 'Compass', key: 'compass', lucideName: 'Compass', category: 'navigation' },
  { name: 'Users', key: 'users', lucideName: 'Users', category: 'social' },
  { name: 'Star', key: 'star', lucideName: 'Star', category: 'general' },
  { name: 'Leaf', key: 'leaf', lucideName: 'Leaf', category: 'practice' },
  { name: 'Flame', key: 'flame', lucideName: 'Flame', category: 'practice' },
  { name: 'Home', key: 'house', lucideName: 'Home', category: 'navigation' },
  { name: 'Facebook', key: 'facebook', lucideName: 'Facebook', category: 'social' },
  { name: 'YouTube', key: 'youtube', lucideName: 'Youtube', category: 'social' },
  { name: 'Zalo', key: 'zalo', lucideName: 'MessageCircleQuestion', category: 'social' },
  { name: 'TikTok', key: 'tiktok', lucideName: 'Music2', category: 'social' },
];

async function main() {
  const appDir = process.cwd();
  const strapi = await strapiFactory
    .createStrapi({ appDir, distDir: path.join(appDir, 'dist') })
    .load();

  let created = 0;
  let updated = 0;

  try {
    for (const item of ICONS) {
      const existing = await strapi.db.query('api::ui-icon.ui-icon').findOne({
        where: { key: item.key },
      });

      if (existing) {
        await strapi.db.query('api::ui-icon.ui-icon').update({
          where: { id: existing.id },
          data: item,
        });
        updated += 1;
      } else {
        await strapi.db.query('api::ui-icon.ui-icon').create({ data: item });
        created += 1;
      }
    }
    console.log(`[ui-icons] created=${created}, updated=${updated}`);
  } finally {
    await strapi.destroy();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
