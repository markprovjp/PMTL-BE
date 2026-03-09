/**
 * PMTL MEGA SEED SCRIPT (Strapi v5)
 * Path: scripts/seed-test.js
 * 
 * Toàn bộ 18 Collection Types & 2 Single Types với dữ liệu thật, liên kết chéo.
 */

const path = require('path');
const strapiFactory = require('@strapi/strapi');

async function seedCore() {
  const appDir = process.cwd();
  const strapi = await strapiFactory.createStrapi({
    appDir,
    distDir: path.join(appDir, 'dist'),
  }).load();
  console.log('\n=============================================');
  console.log('--- STARTING PMTL MEGA SEED (INTERNAL V5) ---');
  console.log('=============================================\n');

  const summary = { created: 0, updated: 0, failed: 0 };

  /** Helper: Upsert (Dùng DB Query cho độ ổn định cao nhất trong v5 seed) */
  async function upsert(uid, uniqueCriteria, data) {
    try {
      const ct = strapi.contentType(uid);
      const hasDP = ct.options.draftAndPublish !== false;

      // Tìm bản ghi hiện tại
      const existing = await strapi.db.query(uid).findOne({ where: uniqueCriteria });

      // Chuẩn hoá data (chuyển objects thành IDs)
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
    const authRole = await strapi.query('plugin::users-permissions.role').findOne({ where: { type: 'authenticated' } });

    // 1. Users (3 users)
    console.log('\n--- 1. Users ---');
    const u_admin = await upsert('plugin::users-permissions.user', { email: 'admin@pmtl.vn' }, {
      username: 'admin_pmtl', email: 'admin@pmtl.vn', password: 'Password123!', fullName: 'Ban Quản Trị PMTL', confirmed: true, role: authRole?.id, dharmaName: 'Quản Trị Viên', bio: 'Tài khoản điều hành hệ thống.'
    });
    const u_ctv = await upsert('plugin::users-permissions.user', { email: 'ctv@pmtl.vn' }, {
      username: 'nguyenhai_ctv', email: 'ctv@pmtl.vn', password: 'Password123!', fullName: 'Nguyễn Hải (CTV)', confirmed: true, role: authRole?.id, dharmaName: 'Nguyên Hải', bio: 'Cộng tác viên biên tập nội dung Khai Thị.'
    });
    const u_cusi = await upsert('plugin::users-permissions.user', { email: 'cusi@pmtl.vn' }, {
      username: 'dieuam_cusi', email: 'cusi@pmtl.vn', password: 'Password123!', fullName: 'Cư Sĩ Diệu Âm', confirmed: true, role: authRole?.id, dharmaName: 'Diệu Âm', bio: 'Người tu học tinh tấn, chia sẻ kinh nghiệm trợ niệm.'
    });

    // 2. Categories (Hierarchy)
    console.log('\n--- 2. Categories ---');
    const cat_phapbao = await upsert('api::category.category', { slug: 'nam-dai-phap-bao' }, { name: 'Nam Đại Pháp Bảo', slug: 'nam-dai-phap-bao', color: '#f59e0b', description: 'Nội dung cốt lõi: Khai thị, Niệm Phật, Phóng Sinh, Lập Nguyện.' });
    const cat_bachthoai = await upsert('api::category.category', { slug: 'bach-thoai-phat-phap' }, { name: 'Bạch Thoại Phật Pháp', slug: 'bach-thoai-phat-phap', parent: cat_phapbao, color: '#d97706' });
    const cat_troniem = await upsert('api::category.category', { slug: 'huong-dan-tro-niem' }, { name: 'Hướng Dẫn Trợ Niệm', slug: 'huong-dan-tro-niem', color: '#10b981', description: 'Các bài viết thực tế về trợ niệm lâm chung.' });
    const cat_daotrang = await upsert('api::category.category', { slug: 'sinh-hoat-dao-trang' }, { name: 'Sinh Hoạt Đạo Tràng', slug: 'sinh-hoat-dao-trang', color: '#3b82f6' });

    // 3. Tags
    console.log('\n--- 3. Tags ---');
    const tag_list = ['niem-phat', 'tro-niem', 'khai-thi', 'phap-hoi', 'tu-hoc', 'phong-sinh', 'nhan-qua', 'tinh-do'];
    const tags = {};
    for (const t of tag_list) {
      tags[t] = await upsert('api::blog-tag.blog-tag', { slug: t }, { name: t.replace('-', ' ').toUpperCase(), slug: t });
    }

    // 4. Blog Posts (Nội Dung · Bài Viết)
    console.log('\n--- 4. Blog Posts ---');
    const post1 = await upsert('api::blog-post.blog-post', { slug: 'tam-quan-trong-tro-niem' }, {
      title: 'Tầm Quan Trọng Của Việc Trợ Niệm Vãng Sinh',
      slug: 'tam-quan-trong-tro-niem',
      content: 'Trong giờ phút lâm chung, tâm thức người ra đi rất yếu đuối. Sự trợ giúp của đạo hữu niệm Phật là vô giá...',
      excerpt: 'Hướng dẫn trợ niệm đúng pháp để giúp người lâm chung vãng sinh Cực Lạc.',
      categories: [cat_troniem],
      tags: [tags['tro-niem'], tags['niem-phat']],
      featured: true, views: 1540, likes: 89, publishedAt: new Date()
    });
    const post2 = await upsert('api::blog-post.blog-post', { slug: 'bach-thoai-tap-1' }, {
      title: 'Bạch Thoại Phật Pháp - Tập 1: Nhân Quả Đời Người',
      slug: 'bach-thoai-tap-1',
      content: 'Cuộc đời là một chuỗi nhân quả không dứt. Hiểu nhân quả để sống an nhiên...',
      excerpt: 'Lời giảng dễ hiểu về quy luật nhân quả ứng dụng trong đời thường.',
      categories: [cat_bachthoai],
      tags: [tags['khai-thi'], tags['nhan-qua']],
      views: 920, publishedAt: new Date()
    });
    const post3 = await upsert('api::blog-post.blog-post', { slug: 'le-phong-sinh-2026' }, {
      title: 'Thông Bạch Lễ Phóng Sinh Đầu Xuân 2026',
      slug: 'le-phong-sinh-2026',
      content: 'Ban quản trị thông báo tổ chức đại lễ phóng sinh tại Thượng Nguồn sông Hồng...',
      categories: [cat_phapbao, cat_daotrang],
      tags: [tags['phong-sinh'], tags['phap-hoi']],
      eventDate: '2026-02-15', location: 'Hà Nội'
    });

    // 5. Blog Comments (Cộng Đồng · Bình Luận Blog)
    console.log('\n--- 5. Blog Comments ---');
    if (post1) {
      const c1 = await upsert('api::blog-comment.blog-comment', { content: 'Nam mô A Di Đà Phật, bài viết rất thiết thực.' }, { content: 'Nam mô A Di Đà Phật, bài viết rất thiết thực.', authorName: 'Huệ Liên', post: post1 });
      await upsert('api::blog-comment.blog-comment', { content: 'Tri ân đạo hữu đã quan tâm.' }, { content: 'Tri ân đạo hữu đã quan tâm.', authorName: 'Ban Quản Trị', post: post1, parent: c1, isOfficialReply: true, badge: 'BQT' });
    }

    // 6. Community Posts (Cộng Đồng · Bài Đăng)
    console.log('\n--- 6. Community Posts ---');
    const cp1 = await upsert('api::community-post.community-post', { slug: 'hanh-trinh-niem-phat' }, {
      title: 'Hành trình vượt qua bệnh tật nhờ niệm Phật',
      slug: 'hanh-trinh-niem-phat',
      content: 'Con xin chia sẻ câu chuyện thật của chính mình khi đối diện với căn bệnh ung thư...',
      type: 'story',
      category: 'Sức Khoẻ',
      author_name: u_cusi.fullName,
      author_country: 'Việt Nam',
      user: u_cusi.id,
      likes: 215, views: 640, pinned: true,
      tags: ['niem-phat-tri-benh', 'mầu-nhiệm']
    });
    const cp2 = await upsert('api::community-post.community-post', { slug: 'gop-y-giao-dien' }, {
      title: 'Góp ý về giao diện website mới',
      slug: 'gop-y-giao-dien',
      content: 'Website rất đẹp nhưng phần font chữ hơi nhỏ so với người lớn tuổi...',
      type: 'feedback',
      category: 'Khác',
      author_name: 'Minh Tâm',
      author_country: 'Canada',
      user: null,
      rating: 4
    });

    // 7. Community Comments (Cộng Đồng · Bình Luận CĐ)
    console.log('\n--- 7. Community Comments ---');
    if (cp1) {
      const cc1 = await upsert('api::community-comment.community-comment', { content: 'Thật tuyệt vời, chúc mừng đạo hữu Diệu Âm!' }, { content: 'Thật tuyệt vời, chúc mừng đạo hữu Diệu Âm!', post: cp1.id, author_name: 'Phật Tử Huệ Liên' });
      await upsert('api::community-comment.community-comment', { content: 'Tâm tịnh thì ắt bệnh tan.' }, { content: 'Tâm tịnh thì ắt bệnh tan.', post: cp1.id, parent: cc1.id, author_name: 'Đạo hữu Minh Triết' });
    }

    // 8. Guestbook Entries (Cộng Đồng · Sổ Lưu Bút)
    console.log('\n--- 8. Guestbook ---');
    await upsert('api::guestbook-entry.guestbook-entry', { message: 'Con kính chúc đạo tràng ngày càng lan tỏa ánh sáng Phật Pháp.' }, { authorName: 'Lê Minh', message: 'Con kính chúc đạo tràng ngày càng lan tỏa ánh sáng Phật Pháp.', approvalStatus: 'approved', year: 2026, month: 3 });
    await upsert('api::guestbook-entry.guestbook-entry', { message: 'Làm sao để đăng ký vào Ban Trợ Niệm ạ?' }, { authorName: 'Nguyễn Văn An', message: 'Làm sao để đăng ký vào Ban Trợ Niệm ạ?', approvalStatus: 'approved', year: 2026, month: 3, entryType: 'question', isAnswered: true, adminReply: 'Chào bạn, bạn có thể nhắn tin trực tiếp qua fanpage hoặc số hotline nhé.' });

    // 9. Events (Nội Dung · Sự Kiện)
    console.log('\n--- 9. Events ---');
    await upsert('api::event.event', { slug: 'khoa-tu-tinh-tan-mua-xuan' }, { title: 'Khóa Tu Tinh Tấn Mùa Xuân 2026', slug: 'khoa-tu-tinh-tan-mua-xuan', description: 'Ba ngày tu tập chuyên sâu về tịnh độ.', date: '2026-03-20', location: 'Chùa Tây Thiên', type: 'retreat', eventStatus: 'upcoming' });
    await upsert('api::event.event', { slug: 'le-via-quan-am' }, { title: 'Đại Lễ Vía Quán Thế Âm Bồ Tát', slug: 'le-via-quan-am', date: '2026-04-05', type: 'ceremony' });

    // 10. Beginner Guides (Nội Dung · Hướng Dẫn Sơ Học)
    console.log('\n--- 10. Guides ---');
    await upsert('api::beginner-guide.beginner-guide', { title: 'Hướng Dẫn Quy Y Tam Bảo' }, { title: 'Hướng Dẫn Quy Y Tam Bảo', guide_type: 'so-hoc', description: 'Các bước chuẩn bị và ý nghĩa của việc thành đệ tử Phật.', order: 1 });
    await upsert('api::beginner-guide.beginner-guide', { title: 'Hành Trì Mỗi Ngày Cho Người Mới' }, { title: 'Hành Trì Mỗi Ngày Cho Người Mới', guide_type: 'kinh-bai-tap', description: 'Các bài kinh ngắn dễ thuộc cho người bắt đầu.', order: 2 });

    // 11. Download Items (Thư Viện · Tài Liệu Tải)
    console.log('\n--- 11. Downloads ---');
    const d1 = await upsert('api::download-item.download-item', { title: 'Kinh Vô Lượng Thọ (PDF)' }, { title: 'Kinh Vô Lượng Thọ (PDF)', url: '/files/vlt-full.pdf', fileType: 'pdf', category: 'Kinh Điển', fileSizeMB: 3.5 });
    const d2 = await upsert('api::download-item.download-item', { title: 'Niệm Phật App (Android)' }, { title: 'Niệm Phật App (Android)', url: 'https://google.play/pmtl', fileType: 'apk', category: 'Ứng Dụng' });

    // 12. Hub Pages (Nội Dung · Trang Tổng Hợp)
    console.log('\n--- 12. Hub Pages ---');
    await upsert('api::hub-page.hub-page', { slug: 'trung-tam-tu-hoc' }, {
      title: 'Trung Tâm Tu Học Trực Tuyến',
      slug: 'trung-tam-tu-hoc',
      description: 'Nơi tập hợp tất cả tài liệu và bài giảng cốt lõi.',
      visualTheme: 'practice',
      curated_posts: [post1, post2].filter(Boolean),
      downloads: [d1, d2].filter(Boolean),
      sections: [
        { heading: 'Khai Thị Cốt Lõi', description: 'Lời vàng từ các bậc thầy.', links: [{ title: 'Xem Bài Giảng', url: '/posts?cat=khai-thi', kind: 'internal' }] }
      ],
      blocks: [
        { __component: 'blocks.post-list-auto', heading: 'Hướng Dẫn Mới Nhất', category: cat_troniem, count: 4 }
      ]
    });

    // 13. Chant Items (Niệm Kinh · Danh Mục Bài Niệm)
    console.log('\n--- 13. Chant Items ---');
    const ch_db = await upsert('api::chant-item.chant-item', { slug: 'chu-dai-bi' }, { title: 'Chú Đại Bi', slug: 'chu-dai-bi', kind: 'mantra', recommendedPresets: [7, 21, 108] });
    const ch_sh = await upsert('api::chant-item.chant-item', { slug: 'le-phat-sam-hoi' }, { title: 'Lễ Phật Sám Hối Văn', slug: 'le-phat-sam-hoi', kind: 'sutra' });
    const ch_ad = await upsert('api::chant-item.chant-item', { slug: 'niem-phat-a-di-da' }, { title: 'Niệm Phật A Di Đà', slug: 'niem-phat-a-di-da', kind: 'mantra', recommendedPresets: [1000, 3000, 10000] });

    // 14. Chant Plans (Niệm Kinh · Lịch Trình Niệm)
    console.log('\n--- 14. Chant Plans ---');
    const plan_daily = await upsert('api::chant-plan.chant-plan', { slug: 'daily-basic' }, {
      title: 'Thời Khóa Cơ Bản Hàng Ngày',
      slug: 'daily-basic',
      planType: 'daily',
      planItems: [{ item: ch_db, targetDefault: 7 }, { item: ch_sh, targetDefault: 1 }, { item: ch_ad, targetDefault: 1000 }]
    });

    // 15. Lunar Events (Niệm Kinh · Lịch Sự Kiện Âm)
    console.log('\n--- 15. Lunar Events ---');
    const lunar_vpa = await upsert('api::lunar-event.lunar-event', { title: 'Ngày Vía Phật A Di Đà' }, { title: 'Ngày Vía Phật A Di Đà', lunarMonth: 11, lunarDay: 17, eventType: 'buddha', color: '#ffcc00', relatedBlogs: [post1] });
    await upsert('api::lunar-event.lunar-event', { title: 'Ngày Vía Quan Thế Âm (19/2)' }, { title: 'Ngày Vía Quan Thế Âm (19/2)', lunarMonth: 2, lunarDay: 19, eventType: 'bodhisattva' });

    // 16. Lunar Overrides (Niệm Kinh · Giới Hạn Ngày ĐB)
    console.log('\n--- 16. Lunar Overrides ---');
    if (lunar_vpa && ch_ad) {
      await upsert('api::lunar-event-chant-override.lunar-event-chant-override', { note: 'Tăng mục tiêu niệm phật ngày Vía.' }, {
        lunarEvent: lunar_vpa.id, item: ch_ad.id, mode: 'override_target', target: 3000, note: 'Tăng mục tiêu niệm phật ngày Vía.'
      });
    }

    // 17. Practice Log (Niệm Kinh · Nhật Ký Tu Học)
    console.log('\n--- 17. Practice Logs ---');
    if (u_cusi && plan_daily) {
      // Xoá bớt logs cũ để test
      await strapi.db.query('api::practice-log.practice-log').create({
        data: { user: u_cusi.id, plan: plan_daily.id, date: '2026-03-07', isCompleted: true, itemsProgress: { 'chu-dai-bi': { count: 7, done: true }, 'le-phat-sam-hoi': { count: 1, done: true } } }
      });
    }

    // 18. Push Config (Hệ Thống · Cấu Hình Push)
    console.log('\n--- 18. Push Subscriptions ---');
    await upsert('api::push-subscription.push-subscription', { endpoint: 'https://fcm.pmtl.vn/v5/001' }, { endpoint: 'https://fcm.pmtl.vn/v5/001', p256dh: 'FAKE_KEY_1', auth: 'FAKE_AUTH_1' });

    // 19. Single Types (Cấu Hình · Hệ Thống Trang Chủ)
    console.log('\n--- 19. Single Types ---');
    await strapi.service('api::setting.setting').createOrUpdate({
      data: {
        siteTitle: 'Pháp Môn Tâm Linh',
        siteDescription: 'Cổng thông tin tu học và trợ niệm chính thống.',
        siteKeywords: 'phật pháp, niệm phật, trợ niệm, khai thị, tâm linh',
        contactEmail: 'lienhe@pmtl.vn',
        heroSlides: [
          { title: 'Hành Trình Giác Ngộ', highlight: 'Bắt đầu từ tâm thiện', sub: 'Nơi tập hợp những lời khai thị quý giá và hướng dẫn hành trì đúng pháp.' },
          { title: 'Trợ Niệm Vãng Sinh', highlight: 'Sứ mệnh cuối cùng', sub: 'Hướng dẫn chuẩn xác về các bước chuẩn bị lâm chung và trợ niệm hộ tống hương linh.' }
        ],
        stats: [
          { label: 'Đạo hữu tham gia', value: '5,000+', detail: 'Phủ khắp 63 tỉnh thành' },
          { label: 'Bài viết hữu ích', value: '1,200+', detail: 'Cập nhật hàng ngày' },
          { label: 'Tài liệu pháp bảo', value: '300+', detail: 'Kinh điển & Âm thanh' }
        ],
        phapBao: [
          { title: 'Khai Thị', chinese: '開示', color: '#f59e0b', description: 'Những bài giảng bạch thoại dễ hiểu.', link: '/posts?cat=khai-thi', iconType: 'flame' },
          { title: 'Niệm Phật', chinese: '念佛', color: '#10b981', description: 'Hướng dẫn phương pháp niệm phật vãng sinh.', link: '/chanting', iconType: 'heart' }
        ],
        featuredVideos: [
          { videoId: 'intro', title: 'Giới Thiệu Website PMTL', subtitle: 'Hướng dẫn sử dụng', youtubeId: 'dQw4w9WgXcQ', duration: '05:30' }
        ]
      }
    });

    // 20. Sidebar Config (Cấu Hình · Thanh Bên)
    await strapi.service('api::sidebar-config.sidebar-config').createOrUpdate({
      data: {
        showSearch: true,
        showCategoryTree: true,
        showArchive: true,
        showLatestComments: true,
        showDownloadLinks: true,
        downloadLinks: [
          { title: 'Kinh Vô Lượng Thọ', url: '/files/vlt.pdf' },
          { title: 'Hướng Dẫn Trợ Niệm', url: '/guide/tro-niem' }
        ],
        socialLinks: [
          { label: 'YouTube', url: 'https://youtube.com/pmtl', iconName: 'youtube' },
          { label: 'Facebook', url: 'https://fb.com/pmtl', iconName: 'facebook' }
        ]
      }
    });

  } catch (err) {
    console.error('\n!!! CRITICAL ERROR DURING MEGA SEED:', err);
  }

  console.log('\n=============================================');
  console.log('--- MEGA SEED SUMMARY ---');
  console.table(summary);
  console.log('--- ALL DONE! Website is now fully populated. ---');
  console.log('=============================================\n');

  await strapi.destroy();
  return summary;
}

module.exports = { seedCore };

if (require.main === module) {
  seedCore()
    .then(() => process.exit(0))
    .catch(async (err) => {
      console.error(err);
      process.exit(1);
    });
}
