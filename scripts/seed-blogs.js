const { faker } = require('@faker-js/faker');
const axios = require('axios');

/**
 * Script này gọi API local để tạo dữ liệu giả.
 * Anh cần chạy Strapi (npm run develop) trước khi chạy script này.
 */

// Cấu hình
const STRAPI_URL = 'http://localhost:1337';
const COUNT = 100; // Số bài muốn tạo thêm
// LƯU Ý: Anh cần tạo 1 API Token có quyền Create cho blog-post trong Strapi Admin
// Hoặc mở quyền Public Create cho blog-post tạm thời (Admin -> Settings -> Roles -> Public).
const API_TOKEN = '';

async function seed() {
  console.log(`🚀 Bắt đầu tạo ${COUNT} bài viết giả...`);

  try {
    // 1. Lấy danh sách category và tag hiện có để gắn vào bài viết cho thật
    const catsRes = await axios.get(`${STRAPI_URL}/api/categories`);
    const tagsRes = await axios.get(`${STRAPI_URL}/api/blog-tags`);

    const categories = catsRes.data.data.map(c => c.documentId);
    const tags = tagsRes.data.data.map(t => t.documentId);

    if (categories.length === 0) {
      console.warn('⚠️ Cảnh báo: Không tìm thấy Category nào. Vui lòng tạo ít nhất 1 Category trước.');
    }

    const headers = API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {};

    for (let i = 0; i < COUNT; i++) {
      const title = faker.lorem.sentence({ min: 5, max: 12 });
      const content = `
        <h2>${faker.lorem.words(3)}</h2>
        <p>${faker.lorem.paragraphs(2)}</p>
        <blockquote>${faker.lorem.sentence()}</blockquote>
        <p>${faker.lorem.paragraphs(3)}</p>
        <p><i>${faker.lorem.sentence()}</i></p>
      `;

      const postData = {
        data: {
          title: title,
          content: content,
          excerpt: faker.lorem.sentences(2).substring(0, 250),
          status: 'published',
          featured: Math.random() > 0.8,
          views: faker.number.int({ min: 100, max: 5000 }),
          likes: faker.number.int({ min: 10, max: 500 }),
          // Gắn ngẫu nhiên 1-2 category và 2-4 tags
          categories: categories.length > 0 ? [faker.helpers.arrayElement(categories)] : [],
          tags: tags.length > 0 ? faker.helpers.arrayElements(tags, { min: 1, max: 3 }) : [],
        }
      };

      try {
        await axios.post(`${STRAPI_URL}/api/blog-posts`, postData, { headers });
        process.stdout.write(`.`);
        if ((i + 1) % 20 === 0) console.log(` (${i + 1}/${COUNT})`);
      } catch (err) {
        console.error(`\n❌ Lỗi khi tạo bài thứ ${i + 1}:`, err.response?.data || err.message);
        if (err.response?.status === 403) {
          console.error('👉 Vui lòng mở quyền "Create" cho Public role trong Strapi Admin settings.');
          break;
        }
      }
    }

    console.log('\n✅ Hoàn tất! Dữ liệu đã được nạp.');
  } catch (err) {
    console.error('❌ Lỗi khởi tạo:', err.message);
  }
}

seed();
