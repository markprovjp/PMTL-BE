const path = require('path');
const strapiFactory = require('@strapi/strapi');

async function seedRich() {
  const appDir = process.cwd();
  const strapi = await strapiFactory.createStrapi({
    appDir,
    distDir: path.join(appDir, 'dist'),
  }).load();

  const summary = { created: 0, updated: 0, failed: 0 };

  async function upsert(uid, uniqueCriteria, data) {
    try {
      const contentType = strapi.contentType(uid);
      const hasDraftAndPublish = contentType?.options?.draftAndPublish !== false;
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

      if (existing) {
        await strapi.db.query(uid).update({ where: { id: existing.id }, data: cleanData });
        if (hasDraftAndPublish) {
          await strapi.db.query(uid).update({ where: { id: existing.id }, data: { published_at: new Date() } });
        }
        summary.updated++;
        return await strapi.db.query(uid).findOne({ where: { id: existing.id } });
      }

      const created = await strapi.db.query(uid).create({ data: cleanData });
      if (hasDraftAndPublish) {
        await strapi.db.query(uid).update({ where: { id: created.id }, data: { published_at: new Date() } });
      }
      summary.created++;
      return created;
    } catch (error) {
      summary.failed++;
      console.error(`[seed-rich] ${uid} failed:`, error.message);
      return null;
    }
  }

  async function one(uid, where) {
    return strapi.db.query(uid).findOne({ where });
  }

  try {
    const authRole = await one('plugin::users-permissions.role', { type: 'authenticated' });

    const users = {
      huelien: await upsert('plugin::users-permissions.user', { email: 'huelien@pmtl.vn' }, {
        username: 'huelien_pt', email: 'huelien@pmtl.vn', password: 'Password123!', fullName: 'Phật Tử Huệ Liên', confirmed: true, role: authRole?.id, dharmaName: 'Huệ Liên', phone: '0903000001', address: 'TP. Hồ Chí Minh', bio: 'Thành viên ban trợ niệm.'
      }),
      minhtriet: await upsert('plugin::users-permissions.user', { email: 'minhtriet@pmtl.vn' }, {
        username: 'minhtriet_pt', email: 'minhtriet@pmtl.vn', password: 'Password123!', fullName: 'Đạo Hữu Minh Triết', confirmed: true, role: authRole?.id, dharmaName: 'Minh Triết', phone: '0903000002', address: 'Đà Nẵng', bio: 'Phụ trách truyền thông và học pháp.'
      }),
      thienngoc: await upsert('plugin::users-permissions.user', { email: 'thienngoc@pmtl.vn' }, {
        username: 'thienngoc_pt', email: 'thienngoc@pmtl.vn', password: 'Password123!', fullName: 'Phật Tử Thiện Ngọc', confirmed: true, role: authRole?.id, dharmaName: 'Thiện Ngọc', phone: '0903000003', address: 'Sydney', bio: 'Phật tử hải ngoại theo dõi khóa tu online.'
      }),
    };

    const categories = {
      tinhdo: await upsert('api::category.category', { slug: 'phap-mon-tinh-do' }, { name: 'Pháp Môn Tịnh Độ', slug: 'phap-mon-tinh-do', color: '#8b5cf6', order: 2, is_active: true, description: 'Tư liệu chuyên sâu về niệm Phật cầu vãng sinh.' }),
      samhoi: await upsert('api::category.category', { slug: 'sam-hoi-phat-nguyen' }, { name: 'Sám Hối Phát Nguyện', slug: 'sam-hoi-phat-nguyen', color: '#ef4444', order: 3, is_active: true }),
      khoatu: await upsert('api::category.category', { slug: 'khoa-tu-truc-tuyen' }, { name: 'Khóa Tu Trực Tuyến', slug: 'khoa-tu-truc-tuyen', color: '#14b8a6', order: 4, is_active: true }),
    };

    const tags = {
      samhoi: await upsert('api::blog-tag.blog-tag', { slug: 'sam-hoi' }, { name: 'SAM HOI', slug: 'sam-hoi', description: 'Chủ đề sám hối và phát nguyện.' }),
      trian: await upsert('api::blog-tag.blog-tag', { slug: 'tri-an' }, { name: 'TRI AN', slug: 'tri-an', description: 'Chủ đề tri ân và hồi hướng.' }),
      daotrang: await upsert('api::blog-tag.blog-tag', { slug: 'dao-trang' }, { name: 'DAO TRANG', slug: 'dao-trang', description: 'Sinh hoạt đạo tràng và công quả.' }),
      tructuyen: await upsert('api::blog-tag.blog-tag', { slug: 'truc-tuyen' }, { name: 'TRUC TUYEN', slug: 'truc-tuyen', description: 'Nội dung khóa tu trực tuyến.' }),
      tinhdo: await one('api::blog-tag.blog-tag', { slug: 'tinh-do' }),
      tuhoc: await one('api::blog-tag.blog-tag', { slug: 'tu-hoc' }),
      khaithe: await one('api::blog-tag.blog-tag', { slug: 'khai-thi' }),
      troniem: await one('api::blog-tag.blog-tag', { slug: 'tro-niem' }),
    };

    const basePosts = {
      post1: await one('api::blog-post.blog-post', { slug: 'tam-quan-trong-tro-niem' }),
      post2: await one('api::blog-post.blog-post', { slug: 'bach-thoai-tap-1' }),
    };

    const extraPosts = {
      post4: await upsert('api::blog-post.blog-post', { slug: 'muoi-buoc-ho-tro-lam-chung' }, {
        title: 'Mười Bước Hộ Trợ Lâm Chung Đúng Pháp',
        slug: 'muoi-buoc-ho-tro-lam-chung',
        content: 'Bài viết hệ thống từng bước hộ niệm, nhắc nhở, trợ duyên và an định đạo tâm cho người bệnh.',
        excerpt: 'Checklist 10 bước trợ duyên lâm chung cho gia đình và đạo hữu.',
        categories: [categories.tinhdo],
        tags: [tags.troniem, tags.tinhdo, tags.tuhoc].filter(Boolean),
        featured: true,
        views: 2140,
        unique_views: 1605,
        likes: 145,
        allowComments: true,
        commentCount: 8,
        sourceName: 'PMTL',
        sourceUrl: 'https://phapmontamlinh.vn',
        sourceTitle: 'Cẩm nang trợ niệm',
        seo: { metaTitle: 'Mười Bước Hộ Trợ Lâm Chung Đúng Pháp', metaDescription: 'Checklist hộ niệm dành cho gia đình và ban trợ niệm.' }
      }),
      post5: await upsert('api::blog-post.blog-post', { slug: 'series-tinh-do-tap-2' }, {
        title: 'Tịnh Độ Thực Hành - Tập 2: Giữ Chánh Niệm Trong Đời Sống',
        slug: 'series-tinh-do-tap-2',
        content: 'Giữ chánh niệm không chỉ lúc niệm Phật mà còn trong công việc, gia đình và các mối quan hệ hằng ngày.',
        excerpt: 'Tập 2 của series Tịnh Độ thực hành trong đời sống hiện đại.',
        categories: [categories.tinhdo],
        tags: [tags.tinhdo, tags.tuhoc, tags.khaithe].filter(Boolean),
        seriesKey: 'tinh-do-thuc-hanh',
        seriesNumber: 2,
        views: 1320,
        unique_views: 1004,
        likes: 91,
        allowComments: true,
        commentCount: 5,
        related_posts: [basePosts.post2].filter(Boolean),
      }),
      post6: await upsert('api::blog-post.blog-post', { slug: 'sam-hoi-moi-dem-chuyen-hoa-nghiep' }, {
        title: 'Sám Hối Mỗi Đêm Để Chuyển Hóa Nghiệp Tập',
        slug: 'sam-hoi-moi-dem-chuyen-hoa-nghiep',
        content: 'Thực hành sám hối ngắn mỗi tối giúp soi sáng lỗi lầm và nuôi dưỡng tâm khiêm hạ.',
        excerpt: 'Phương pháp sám hối ngắn 15 phút trước giờ ngủ.',
        categories: [categories.samhoi],
        tags: [tags.samhoi, tags.tuhoc].filter(Boolean),
        views: 960,
        unique_views: 730,
        likes: 58,
        allowComments: true,
        commentCount: 4,
      }),
      post7: await upsert('api::blog-post.blog-post', { slug: 'tong-ket-khoa-tu-online-thang-3' }, {
        title: 'Tổng Kết Khóa Tu Online Tháng 3',
        slug: 'tong-ket-khoa-tu-online-thang-3',
        content: 'Khóa tu trực tuyến tháng 3 ghi nhận hơn 1.800 lượt tham dự cùng chuỗi thời khóa sáng tối đều đặn.',
        excerpt: 'Những điểm nổi bật từ khóa tu trực tuyến tháng 3 của đạo tràng.',
        categories: [categories.khoatu],
        tags: [tags.daotrang, tags.tructuyen].filter(Boolean),
        views: 710,
        unique_views: 520,
        likes: 39,
        allowComments: true,
        commentCount: 2,
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      }),
    };

    await upsert('api::blog-comment.blog-comment', { content: 'Xin hỏi trường hợp người bệnh hôn mê sâu thì trợ niệm ra sao?' }, {
      content: 'Xin hỏi trường hợp người bệnh hôn mê sâu thì trợ niệm ra sao?',
      authorName: 'Thiện Ngọc',
      user: users.thienngoc,
      userId: String(users.thienngoc?.id || ''),
      post: basePosts.post1,
      likes: 7,
      moderationStatus: 'visible',
      ipHash: 'seed-ip-001',
      spamScore: 0
    });
    await upsert('api::blog-comment.blog-comment', { content: 'Bình luận này đang được kiểm tra vì chứa link ngoài.' }, {
      content: 'Bình luận này đang được kiểm tra vì chứa link ngoài.',
      authorName: 'Người dùng lạ',
      post: basePosts.post1,
      moderationStatus: 'flagged',
      reportCount: 2,
      lastReportReason: 'Chứa liên kết không liên quan',
      spamScore: 48
    });

    const community = {
      post3: await upsert('api::community-post.community-post', { slug: 'video-chia-se-tu-hoc-dem-khuya' }, {
        title: 'Video chia sẻ thời khóa tu học đêm khuya',
        slug: 'video-chia-se-tu-hoc-dem-khuya',
        content: 'Mình quay lại thời khóa 45 phút niệm Phật trước khi ngủ, hy vọng giúp ai đó tạo động lực hành trì đều hơn.',
        type: 'video',
        category: 'Tâm Linh',
        author_name: users.huelien?.fullName,
        author_country: 'Việt Nam',
        user: users.huelien?.id,
        likes: 88,
        views: 430,
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        tags: ['thoi-khoa-dem', 'niem-phat', 'video-chia-se'],
        moderationStatus: 'visible',
        rating: 5
      }),
      post4: await upsert('api::community-post.community-post', { slug: 'cau-hoi-ve-mat-ngu-lau-ngay' }, {
        title: 'Mất ngủ lâu ngày nên bắt đầu hành trì thế nào?',
        slug: 'cau-hoi-ve-mat-ngu-lau-ngay',
        content: 'Tôi bị mất ngủ kéo dài, tâm trí thường loạn động. Xin đạo hữu hướng dẫn thời khóa phù hợp cho người mới.',
        type: 'story',
        category: 'Mất Ngủ',
        author_name: 'Lan Anh',
        author_country: 'Hoa Kỳ',
        likes: 24,
        views: 190,
        tags: ['mat-ngu', 'nguoi-moi', 'hoi-dap'],
        moderationStatus: 'flagged',
        reportCount: 1,
        lastReportReason: 'Cần biên tập lại tiêu đề',
        rating: 3
      }),
    };

    await upsert('api::community-comment.community-comment', { content: 'Bài chia sẻ làm mình có thêm niềm tin để tiếp tục hành trì.' }, {
      content: 'Bài chia sẻ làm mình có thêm niềm tin để tiếp tục hành trì.',
      post: community.post3?.id,
      user: users.thienngoc?.id,
      author_name: 'Thiện Ngọc',
      likes: 11,
      moderationStatus: 'visible',
      spamScore: 0
    });
    await upsert('api::community-comment.community-comment', { content: 'Comment này bị ẩn vì quảng cáo ngoài lề.' }, {
      content: 'Comment này bị ẩn vì quảng cáo ngoài lề.',
      post: community.post4?.id,
      author_name: 'Spam Bot',
      moderationStatus: 'hidden',
      reportCount: 4,
      lastReportReason: 'Quảng cáo',
      isHidden: true,
      spamScore: 90
    });

    await upsert('api::guestbook-entry.guestbook-entry', { message: 'Con xin tri ân bài giảng về nhân quả đã giúp gia đình con hóa giải nhiều hiểu lầm.' }, {
      authorName: 'Huỳnh Mai', country: 'Việt Nam', message: 'Con xin tri ân bài giảng về nhân quả đã giúp gia đình con hóa giải nhiều hiểu lầm.', approvalStatus: 'approved', year: 2026, month: 2, entryType: 'message', isOfficialReply: true, badge: 'Tri Ân'
    });
    await upsert('api::guestbook-entry.guestbook-entry', { message: 'Khi nào có khóa tu dành cho người mới ở Sydney ạ?' }, {
      authorName: 'Ngọc Hân', country: 'Australia', message: 'Khi nào có khóa tu dành cho người mới ở Sydney ạ?', approvalStatus: 'pending', year: 2026, month: 3, entryType: 'question', questionCategory: 'Khóa tu', isAnswered: false
    });

    const downloads = {
      d3: await upsert('api::download-item.download-item', { title: 'Audio Khai Thị Lâm Chung' }, {
        title: 'Audio Khai Thị Lâm Chung', description: 'Tập audio hướng dẫn khai thị dành cho ban trợ niệm.', url: '/audio/khai-thi-lam-chung.mp3', fileType: 'mp3', category: 'Khai Thị Audio', groupYear: 2026, groupLabel: 'Tư Liệu Trợ Niệm', notes: 'Dùng khi gia đình đã đồng thuận', isNew: true, sortOrder: 1, fileSizeMB: 48.6
      }),
      d4: await upsert('api::download-item.download-item', { title: 'Cẩm Nang Người Mới Tu Học' }, {
        title: 'Cẩm Nang Người Mới Tu Học', description: 'Sổ tay tóm lược cho người mới tiếp cận Phật pháp.', url: '/files/cam-nang-nguoi-moi.pdf', fileType: 'pdf', category: 'Hướng Dẫn', groupYear: 2025, groupLabel: 'Cơ Bản', sortOrder: 2, fileSizeMB: 6.2
      }),
      d5: await upsert('api::download-item.download-item', { title: 'Playlist Pháp Hội Mùa Xuân' }, {
        title: 'Playlist Pháp Hội Mùa Xuân', description: 'Danh sách video pháp hội chọn lọc.', url: 'https://youtube.com/playlist?list=PMTL2026', fileType: 'html', category: 'Pháp Hội', groupYear: 2026, groupLabel: 'Media', isNew: true, sortOrder: 3, fileSizeMB: 0
      }),
    };

    await upsert('api::event.event', { slug: 'phap-thoai-truc-tuyen-thang-4' }, {
      title: 'Pháp Thoại Trực Tuyến: Giữ Tâm An Trong Đời Sống Số', slug: 'phap-thoai-truc-tuyen-thang-4', description: 'Buổi chia sẻ trực tuyến về cách hành trì giữa môi trường công việc hiện đại.', content: '<p>Pháp thoại tập trung vào chánh niệm, niệm Phật và cách điều phục vọng tưởng.</p>', date: '2026-04-18', timeString: '20:00 GMT+7', location: 'Zoom Webinar', type: 'webinar', eventStatus: 'upcoming', speaker: 'Ban Quản Trị', language: 'Tiếng Việt', link: 'https://zoom.us/j/123456789', youtubeId: 'dQw4w9WgXcQ'
    });
    await upsert('api::event.event', { slug: 'dem-tri-an-cong-qua' }, {
      title: 'Đêm Tri Ân Công Quả', slug: 'dem-tri-an-cong-qua', description: 'Sự kiện tổng kết và tri ân đạo hữu công quả.', date: '2025-12-28', timeString: '19:30', location: 'TP. Hồ Chí Minh', type: 'festival', eventStatus: 'past', speaker: 'Đạo tràng PMTL', language: 'Tiếng Việt'
    });

    await upsert('api::beginner-guide.beginner-guide', { title: 'Thiết Lập Thời Khóa Sáng 15 Phút' }, {
      title: 'Thiết Lập Thời Khóa Sáng 15 Phút', guide_type: 'so-hoc', description: 'Gợi ý thời khóa đơn giản cho người bận rộn.', content: '<p>Niệm Phật, phát nguyện và hồi hướng trong 15 phút đầu ngày.</p>', details: { checklist: ['Rửa mặt tỉnh thân', 'Thắp hương', 'Niệm Phật 108 câu', 'Hồi hướng'] }, duration: '15 phút', order: 3, step_number: 1, icon: 'sunrise', pdf_url: '/guides/thoi-khoa-sang.pdf', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    });
    await upsert('api::beginner-guide.beginner-guide', { title: 'Bộ Kinh Ngắn Cho Người Mới' }, {
      title: 'Bộ Kinh Ngắn Cho Người Mới', guide_type: 'kinh-bai-tap', description: 'Danh mục kinh ngắn và thứ tự hành trì nên bắt đầu.', content: '<ul><li>Chú Đại Bi</li><li>Niệm Phật A Di Đà</li><li>Bài hồi hướng ngắn</li></ul>', details: { lessons: ['Chú Đại Bi 7 biến', 'A Di Đà 300 câu', 'Hồi hướng'] }, duration: '20 phút', order: 4, step_number: 2, icon: 'book-open'
    });

    const chants = {
      hoihuong: await upsert('api::chant-item.chant-item', { slug: 'hoi-huong-ngan' }, {
        title: 'Bài Hồi Hướng Ngắn', slug: 'hoi-huong-ngan', kind: 'step', content: '<p>Nguyện đem công đức này trang nghiêm Phật tịnh độ...</p>', timeRules: { when: 'after-session' }, recommendedPresets: [1]
      }),
      adida: await one('api::chant-item.chant-item', { slug: 'niem-phat-a-di-da' }),
      daibi: await one('api::chant-item.chant-item', { slug: 'chu-dai-bi' }),
    };

    const specialPlan = await upsert('api::chant-plan.chant-plan', { slug: 'via-phat-a-di-da' }, {
      title: 'Thời Khóa Ngày Vía Phật A Di Đà', slug: 'via-phat-a-di-da', planType: 'special', planItems: [
        { item: chants.daibi, order: 1, targetDefault: 21, targetMin: 7, targetMax: 49, isOptional: false },
        { item: chants.adida, order: 2, targetDefault: 3000, targetMin: 1000, targetMax: 10000, isOptional: false },
        { item: chants.hoihuong, order: 3, targetDefault: 1, targetMin: 1, targetMax: 1, isOptional: false },
      ]
    });

    const lunar = {
      viaA: await one('api::lunar-event.lunar-event', { title: 'Ngày Vía Phật A Di Đà' }),
      ram: await upsert('api::lunar-event.lunar-event', { title: 'Rằm Hàng Tháng' }, { title: 'Rằm Hàng Tháng', isRecurringLunar: true, lunarMonth: 0, lunarDay: 15, eventType: 'fast', relatedBlogs: [extraPosts.post5, extraPosts.post6].filter(Boolean) }),
    };

    await upsert('api::lunar-event-chant-override.lunar-event-chant-override', { note: 'Khuyến khích tụng Chú Đại Bi ngày rằm.' }, {
      lunarEvent: lunar.ram?.id, item: chants.daibi?.id, mode: 'enable', priority: 2, note: 'Khuyến khích tụng Chú Đại Bi ngày rằm.'
    });
    await upsert('api::lunar-event-chant-override.lunar-event-chant-override', { note: 'Giới hạn tối đa niệm Phật cho người mới ngày rằm.' }, {
      lunarEvent: lunar.ram?.id, item: chants.adida?.id, mode: 'cap_max', max: 5000, priority: 3, note: 'Giới hạn tối đa niệm Phật cho người mới ngày rằm.'
    });

    await upsert('api::practice-log.practice-log', { user: users.huelien?.id, date: '2026-04-05' }, {
      user: users.huelien?.id, plan: specialPlan?.id, date: '2026-04-05', startedAt: '2026-04-05T02:00:00.000Z', completedAt: '2026-04-05T03:40:00.000Z', isCompleted: true, itemsProgress: { 'chu-dai-bi': { count: 21, done: true }, 'niem-phat-a-di-da': { count: 3200, done: true }, 'hoi-huong-ngan': { count: 1, done: true } }
      });

    await upsert('api::push-subscription.push-subscription', { endpoint: 'https://fcm.pmtl.vn/v5/002' }, { endpoint: 'https://fcm.pmtl.vn/v5/002', p256dh: 'FAKE_KEY_2', auth: 'FAKE_AUTH_2', reminderHour: 5 });
    await upsert('api::push-subscription.push-subscription', { endpoint: 'https://fcm.pmtl.vn/v5/003' }, { endpoint: 'https://fcm.pmtl.vn/v5/003', p256dh: 'FAKE_KEY_3', auth: 'FAKE_AUTH_3', reminderHour: 21 });

    const d1 = await one('api::download-item.download-item', { title: 'Kinh Vô Lượng Thọ (PDF)' });
    const d2 = await one('api::download-item.download-item', { title: 'Niệm Phật App (Android)' });

    await upsert('api::hub-page.hub-page', { slug: 'thu-vien-khai-thi' }, {
      title: 'Thư Viện Khai Thị', slug: 'thu-vien-khai-thi', description: 'Tổng hợp bài giảng, audio và ghi chú trợ niệm.', visualTheme: 'teaching', curated_posts: [basePosts.post1, basePosts.post2, extraPosts.post6].filter(Boolean), downloads: [d1, downloads.d3, downloads.d5].filter(Boolean), sortOrder: 2, showInMenu: true, menuIcon: 'mic', sections: [{ heading: 'Audio Khai Thị', description: 'Danh mục audio dễ dùng tại đạo tràng.', links: [{ title: 'Mở thư viện audio', url: '/downloads?cat=audio', kind: 'internal' }] }], blocks: [{ __component: 'blocks.post-list-manual', heading: 'Bài Cốt Lõi', description: 'Ba bài quan trọng nhất.', posts: [basePosts.post1, basePosts.post2, extraPosts.post6].filter(Boolean) }]
    });

    await strapi.service('api::setting.setting').createOrUpdate({
      data: {
        siteTitle: 'Pháp Môn Tâm Linh',
        siteDescription: 'Cổng thông tin tu học và trợ niệm chính thống.',
        socialLinks: {
          facebook: 'https://facebook.com/phapmontamlinh',
          youtube: 'https://youtube.com/@phapmontamlinh',
          zalo: 'https://zalo.me/phapmontamlinh'
        },
        contactEmail: 'lienhe@pmtl.vn',
        contactPhone: '+84 909 123 456',
        address: 'Thiền đường PMTL, Quận 7, TP. Hồ Chí Minh',
        footerText: '<p>PMTL là không gian tu học, khai thị, trợ niệm và kết nối cộng đồng Phật tử gần gũi, thực hành và có chiều sâu.</p>',
        actionCards: [
          { title: 'Bắt Đầu Tu Học', description: 'Lộ trình nhập môn dành cho người mới.', link: '/hub/trung-tam-tu-hoc', iconType: 'sparkles' },
          { title: 'Tra Cứu Thời Khóa', description: 'Theo dõi lịch niệm kinh và nhật ký tu học.', link: '/niem-kinh', iconType: 'calendar' },
          { title: 'Tham Gia Cộng Đồng', description: 'Chia sẻ câu chuyện và đặt câu hỏi cùng đạo hữu.', link: '/community', iconType: 'users' }
        ],
        awards: [
          { year: '2024', title: 'Cộng Đồng Tu Học Tiêu Biểu', org: 'Đạo tràng liên kết', description: 'Ghi nhận nỗ lực xây dựng môi trường tu học trực tuyến lành mạnh.' },
          { year: '2025', title: 'Hoạt Động Thiện Nguyện Nổi Bật', org: 'Nhóm thiện nguyện PMTL', description: 'Tri ân đóng góp trong các chương trình hộ niệm và cứu trợ.' }
        ],
        gallerySlides: [
          { caption: 'Khóa tu mùa xuân', subcap: 'Khoảnh khắc đồng tu đầu năm.' },
          { caption: 'Đêm trợ niệm', subcap: 'Ban trợ niệm thực hành nghiêm trang.' }
        ],
        stickyBanner: {
          enabled: true,
          title: 'Tham gia khóa tu trực tuyến tháng này',
          subtitle: 'Đăng ký sớm để nhận lịch thực hành hằng ngày.',
          buttonText: 'Đăng ký ngay',
          buttonLink: '/events'
        }
      }
    });

    await strapi.service('api::sidebar-config.sidebar-config').createOrUpdate({
      data: {
        showSearch: true,
        showCategoryTree: true,
        showArchive: true,
        showLatestComments: true,
        showDownloadLinks: true,
        downloadLinks: [
          { title: 'Kinh Vô Lượng Thọ', url: '/files/vlt.pdf' },
          { title: 'Cẩm Nang Người Mới', url: '/files/cam-nang-nguoi-moi.pdf' },
          { title: 'Audio Khai Thị', url: '/audio/khai-thi-lam-chung.mp3' }
        ],
        socialLinks: [
          { label: 'YouTube', url: 'https://youtube.com/pmtl', iconName: 'youtube' },
          { label: 'Facebook', url: 'https://fb.com/pmtl', iconName: 'facebook' },
          { label: 'Zalo', url: 'https://zalo.me/phapmontamlinh', iconName: 'message-circle' }
        ]
      }
    });
  } finally {
    await strapi.destroy();
  }

  console.log('[seed-rich] summary');
  console.table(summary);
}

if (require.main === module) {
  seedRich()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { seedRich };
