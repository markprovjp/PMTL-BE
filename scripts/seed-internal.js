"use strict";

const { faker } = require('@faker-js/faker');
const strapiFactory = require("@strapi/strapi");
const path = require("path");

/**
 * Script này chạy trực tiếp bên trong context của Strapi.
 */

async function seed() {
  console.log("🚀 Đang khởi tạo Strapi instance (Dist mode)...");

  const appDir = process.cwd();

  const strapi = await strapiFactory.createStrapi({
    appDir,
    distDir: path.join(appDir, "dist"),
  }).load();

  console.log("🚀 Đang khởi tạo dữ liệu giả từ bên trong Strapi...");

  try {
    const UID = "api::blog-post.blog-post";
    // Chúng ta sẽ bỏ qua quan hệ Categories/Tags để tránh lỗi I18N/Validation của Strapi v5 khi seeding nhanh
    // Hoặc nếu muốn thì phải query đúng documentId và đảm bảo nó tồn tại.

    const COUNT = 10000; // Tăng lên 10000 bài theo yêu cầu của anh
    console.log(`Tiến hành tạo ${COUNT} bài viết (Bỏ qua quan hệ để tăng tốc & ổn định)...`);

    for (let i = 0; i < COUNT; i++) {
      const title = faker.lorem.sentence({ min: 5, max: 12 });

      await strapi.documents(UID).create({
        data: {
          title: title,
          slug: faker.helpers.slugify(title).toLowerCase() + '-' + faker.string.alphanumeric(8),
          content: `<h2>${faker.lorem.words(3)}</h2><p>${faker.lorem.paragraphs(3)}</p><p>${faker.lorem.paragraphs(2)}</p>`,
          excerpt: faker.lorem.sentences(2),
          status: 'published',
          featured: Math.random() > 0.95,
          views: faker.number.int({ min: 100, max: 20000 }),
          likes: faker.number.int({ min: 10, max: 2000 }),
          // Không gán categories/tags ở bước này để tránh lỗi "Document not found" do cache/i18n
          publishedAt: new Date(),
        },
        status: 'published'
      });

      if ((i + 1) % 10 === 0) {
        process.stdout.write(".");
      }
      if ((i + 1) % 100 === 0) {
        console.log(` (${i + 1}/${COUNT})`);
      }
    }

    console.log("\n✅ Hoàn tất! Đã nạp 10000 bài viết mới.");
    console.log("💡 Anh có thể vào Admin Panel để gán Category sau nếu muốn, hoặc chạy lại script sau khi Meilisearch đã sync xong.");
  } catch (err) {
    console.error("\n❌ Lỗi trong quá trình seed:", err);
  } finally {
    await strapi.destroy();
    process.exit(0);
  }
}

seed();
