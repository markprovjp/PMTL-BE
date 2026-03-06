import type { Schema, Struct } from '@strapi/strapi';

export interface BlocksDownloadGrid extends Struct.ComponentSchema {
  collectionName: 'components_blocks_download_grids';
  info: {
    description: 'Hi\u1EC3n th\u1ECB l\u01B0\u1EDBi t\u00E0i li\u1EC7u t\u1EA3i xu\u1ED1ng';
    displayName: 'Download Grid';
  };
  attributes: {
    description: Schema.Attribute.Text;
    downloads: Schema.Attribute.Relation<
      'oneToMany',
      'api::download-item.download-item'
    >;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksPostListAuto extends Struct.ComponentSchema {
  collectionName: 'components_blocks_post_list_autos';
  info: {
    description: 'Hi\u1EC3n th\u1ECB danh s\u00E1ch b\u00E0i vi\u1EBFt t\u1EF1 \u0111\u1ED9ng theo ph\u00E2n lo\u1EA1i';
    displayName: 'Post List (Automatic)';
  };
  attributes: {
    category: Schema.Attribute.Relation<'oneToOne', 'api::category.category'>;
    count: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<4>;
    description: Schema.Attribute.Text;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlocksPostListManual extends Struct.ComponentSchema {
  collectionName: 'components_blocks_post_list_manuals';
  info: {
    description: 'Hi\u1EC3n th\u1ECB danh s\u00E1ch b\u00E0i vi\u1EBFt \u0111\u01B0\u1EE3c ch\u1ECDn tay';
    displayName: 'Post List (Manual)';
  };
  attributes: {
    description: Schema.Attribute.Text;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    posts: Schema.Attribute.Relation<'oneToMany', 'api::blog-post.blog-post'>;
  };
}

export interface BlocksRichText extends Struct.ComponentSchema {
  collectionName: 'components_blocks_rich_texts';
  info: {
    description: 'N\u1ED9i dung v\u0103n b\u1EA3n t\u1EF1 do';
    displayName: 'Rich Text';
  };
  attributes: {
    content: Schema.Attribute.RichText;
  };
}

export interface ChantingPlanItem extends Struct.ComponentSchema {
  collectionName: 'components_chanting_plan_items';
  info: {
    description: 'M\u1ED9t b\u00E0i trong k\u1EBF ho\u1EA1ch ni\u1EC7m kinh: li\u00EAn k\u1EBFt chant_item + target/optional config';
    displayName: 'Plan Item';
    icon: 'book';
  };
  attributes: {
    isOptional: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    item: Schema.Attribute.Relation<'oneToOne', 'api::chant-item.chant-item'>;
    order: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<0>;
    targetDefault: Schema.Attribute.Integer;
    targetMax: Schema.Attribute.Integer;
    targetMin: Schema.Attribute.Integer;
  };
}

export interface HomepageActionCardItem extends Struct.ComponentSchema {
  collectionName: 'components_homepage_action_card_items';
  info: {
    displayName: 'Th\u1EBB H\u00E0nh \u0110\u1ED9ng (Action Card Item)';
  };
  attributes: {
    description: Schema.Attribute.Text;
    iconType: Schema.Attribute.String;
    link: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface HomepageAwardItem extends Struct.ComponentSchema {
  collectionName: 'components_homepage_award_items';
  info: {
    displayName: 'Gi\u1EA3i Th\u01B0\u1EDFng (Award Item)';
  };
  attributes: {
    description: Schema.Attribute.Text;
    org: Schema.Attribute.String;
    title: Schema.Attribute.String;
    year: Schema.Attribute.String;
  };
}

export interface HomepageFeaturedVideo extends Struct.ComponentSchema {
  collectionName: 'components_homepage_featured_videos';
  info: {
    displayName: 'Video N\u1ED5i B\u1EADt (Featured Video)';
  };
  attributes: {
    category: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    duration: Schema.Attribute.String;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
    videoId: Schema.Attribute.String;
    youtubeId: Schema.Attribute.String;
  };
}

export interface HomepageGallerySlide extends Struct.ComponentSchema {
  collectionName: 'components_homepage_gallery_slides';
  info: {
    displayName: '\u1EA2nh Ph\u00E1p H\u1ED9i (Gallery Slide)';
  };
  attributes: {
    caption: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'>;
    subcap: Schema.Attribute.String;
  };
}

export interface HomepageHeroSlide extends Struct.ComponentSchema {
  collectionName: 'components_homepage_hero_slides';
  info: {
    description: '';
    displayName: 'Hero Slide';
  };
  attributes: {
    highlight: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'>;
    sub: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface HomepagePhapBaoItem extends Struct.ComponentSchema {
  collectionName: 'components_homepage_phap_bao_items';
  info: {
    displayName: 'Ph\u00E1p B\u1EA3o (Phap Bao Item)';
  };
  attributes: {
    borderColor: Schema.Attribute.String;
    chinese: Schema.Attribute.String;
    color: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    iconType: Schema.Attribute.String;
    item_id: Schema.Attribute.String;
    link: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface HomepageSearchCategory extends Struct.ComponentSchema {
  collectionName: 'components_homepage_search_categories';
  info: {
    displayName: 'Danh M\u1EE5c Tra C\u1EE9u (Search Category)';
  };
  attributes: {
    category_id: Schema.Attribute.Integer;
    iconName: Schema.Attribute.String;
    link: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface HomepageStatItem extends Struct.ComponentSchema {
  collectionName: 'components_homepage_stat_items';
  info: {
    displayName: 'Th\u1ED1ng K\u00EA (Stat Item)';
  };
  attributes: {
    detail: Schema.Attribute.String;
    label: Schema.Attribute.String;
    value: Schema.Attribute.String;
  };
}

export interface HomepageStickyBanner extends Struct.ComponentSchema {
  collectionName: 'components_homepage_sticky_banners';
  info: {
    displayName: 'Sticky Banner';
  };
  attributes: {
    buttonLink: Schema.Attribute.String;
    buttonText: Schema.Attribute.String;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface HubHubLink extends Struct.ComponentSchema {
  collectionName: 'components_hub_hub_links';
  info: {
    displayName: 'Hub Link';
    pluralName: 'hub-links';
    singularName: 'hub-link';
  };
  attributes: {
    description: Schema.Attribute.Text;
    kind: Schema.Attribute.Enumeration<['internal', 'external']> &
      Schema.Attribute.DefaultTo<'internal'>;
    thumbnail: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    url: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
  };
}

export interface HubHubSection extends Struct.ComponentSchema {
  collectionName: 'components_hub_hub_sections';
  info: {
    displayName: 'Hub Section';
    pluralName: 'hub-sections';
    singularName: 'hub-section';
  };
  attributes: {
    description: Schema.Attribute.Text;
    heading: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    links: Schema.Attribute.Component<'hub.hub-link', true>;
  };
}

export interface SharedQuickLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_quick_links';
  info: {
    displayName: 'Quick Link';
    pluralName: 'quick-links';
    singularName: 'quick-link';
  };
  attributes: {
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    url: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: 'SEO metadata component';
    displayName: 'seo';
    icon: 'search';
  };
  attributes: {
    canonicalURL: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    keywords: Schema.Attribute.Text;
    metaDescription: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    metaImage: Schema.Attribute.Media<'images'>;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
  };
}

export interface SharedSocialLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_social_links';
  info: {
    displayName: 'Social Link';
    pluralName: 'social-links';
    singularName: 'social-link';
  };
  attributes: {
    iconName: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    url: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'blocks.download-grid': BlocksDownloadGrid;
      'blocks.post-list-auto': BlocksPostListAuto;
      'blocks.post-list-manual': BlocksPostListManual;
      'blocks.rich-text': BlocksRichText;
      'chanting.plan-item': ChantingPlanItem;
      'homepage.action-card-item': HomepageActionCardItem;
      'homepage.award-item': HomepageAwardItem;
      'homepage.featured-video': HomepageFeaturedVideo;
      'homepage.gallery-slide': HomepageGallerySlide;
      'homepage.hero-slide': HomepageHeroSlide;
      'homepage.phap-bao-item': HomepagePhapBaoItem;
      'homepage.search-category': HomepageSearchCategory;
      'homepage.stat-item': HomepageStatItem;
      'homepage.sticky-banner': HomepageStickyBanner;
      'hub.hub-link': HubHubLink;
      'hub.hub-section': HubHubSection;
      'shared.quick-link': SharedQuickLink;
      'shared.seo': SharedSeo;
      'shared.social-link': SharedSocialLink;
    }
  }
}
