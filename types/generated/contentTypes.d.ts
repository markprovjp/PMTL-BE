import type { Schema, Struct } from '@strapi/strapi';

export interface AdminApiToken extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_api_tokens';
  info: {
    description: '';
    displayName: 'Api Token';
    name: 'Api Token';
    pluralName: 'api-tokens';
    singularName: 'api-token';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Schema.Attribute.DefaultTo<''>;
    encryptedKey: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    expiresAt: Schema.Attribute.DateTime;
    lastUsedAt: Schema.Attribute.DateTime;
    lifespan: Schema.Attribute.BigInteger;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::api-token'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'admin::api-token-permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    type: Schema.Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'read-only'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_api_token_permissions';
  info: {
    description: '';
    displayName: 'API Token Permission';
    name: 'API Token Permission';
    pluralName: 'api-token-permissions';
    singularName: 'api-token-permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::api-token-permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    token: Schema.Attribute.Relation<'manyToOne', 'admin::api-token'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminPermission extends Struct.CollectionTypeSchema {
  collectionName: 'admin_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'Permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
    conditions: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<[]>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::permission'> &
      Schema.Attribute.Private;
    properties: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
    publishedAt: Schema.Attribute.DateTime;
    role: Schema.Attribute.Relation<'manyToOne', 'admin::role'>;
    subject: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminRole extends Struct.CollectionTypeSchema {
  collectionName: 'admin_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'Role';
    pluralName: 'roles';
    singularName: 'role';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::role'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<'oneToMany', 'admin::permission'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    users: Schema.Attribute.Relation<'manyToMany', 'admin::user'>;
  };
}

export interface AdminSession extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_sessions';
  info: {
    description: 'Session Manager storage';
    displayName: 'Session';
    name: 'Session';
    pluralName: 'sessions';
    singularName: 'session';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
    i18n: {
      localized: false;
    };
  };
  attributes: {
    absoluteExpiresAt: Schema.Attribute.DateTime & Schema.Attribute.Private;
    childId: Schema.Attribute.String & Schema.Attribute.Private;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    deviceId: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private;
    expiresAt: Schema.Attribute.DateTime &
      Schema.Attribute.Required &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::session'> &
      Schema.Attribute.Private;
    origin: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    sessionId: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.Unique;
    status: Schema.Attribute.String & Schema.Attribute.Private;
    type: Schema.Attribute.String & Schema.Attribute.Private;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    userId: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private;
  };
}

export interface AdminTransferToken extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_transfer_tokens';
  info: {
    description: '';
    displayName: 'Transfer Token';
    name: 'Transfer Token';
    pluralName: 'transfer-tokens';
    singularName: 'transfer-token';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Schema.Attribute.DefaultTo<''>;
    expiresAt: Schema.Attribute.DateTime;
    lastUsedAt: Schema.Attribute.DateTime;
    lifespan: Schema.Attribute.BigInteger;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token-permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminTransferTokenPermission
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    description: '';
    displayName: 'Transfer Token Permission';
    name: 'Transfer Token Permission';
    pluralName: 'transfer-token-permissions';
    singularName: 'transfer-token-permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token-permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    token: Schema.Attribute.Relation<'manyToOne', 'admin::transfer-token'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminUser extends Struct.CollectionTypeSchema {
  collectionName: 'admin_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'User';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    blocked: Schema.Attribute.Boolean &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<false>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    firstname: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    isActive: Schema.Attribute.Boolean &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<false>;
    lastname: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::user'> &
      Schema.Attribute.Private;
    password: Schema.Attribute.Password &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    preferedLanguage: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    registrationToken: Schema.Attribute.String & Schema.Attribute.Private;
    resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private;
    roles: Schema.Attribute.Relation<'manyToMany', 'admin::role'> &
      Schema.Attribute.Private;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    username: Schema.Attribute.String;
  };
}

export interface ApiBeginnerGuideBeginnerGuide
  extends Struct.CollectionTypeSchema {
  collectionName: 'beginner_guides';
  info: {
    description: 'Qu\u1EA3n l\u00FD c\u00E1c b\u01B0\u1EDBc h\u01B0\u1EDBng d\u1EABn s\u01A1 h\u1ECDc v\u00E0 kinh b\u00E0i t\u1EADp h\u1EB1ng ng\u00E0y';
    displayName: 'N\u1ED9i Dung \u00B7 H\u01B0\u1EDBng D\u1EABn S\u01A1 H\u1ECDc';
    pluralName: 'beginner-guides';
    singularName: 'beginner-guide';
  };
  options: {
    draftAndPublish: true;
    increments: true;
    timestamps: true;
  };
  attributes: {
    attached_files: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    content: Schema.Attribute.RichText;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Text;
    details: Schema.Attribute.JSON;
    duration: Schema.Attribute.String;
    guide_type: Schema.Attribute.Enumeration<['so-hoc', 'kinh-bai-tap']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'so-hoc'>;
    icon: Schema.Attribute.String & Schema.Attribute.DefaultTo<'BookOpen'>;
    images: Schema.Attribute.Media<'images', true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::beginner-guide.beginner-guide'
    > &
      Schema.Attribute.Private;
    order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<1>;
    pdf_url: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    publishedAt: Schema.Attribute.DateTime;
    step_number: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<1>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    video_url: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
  };
}

export interface ApiBlogCommentBlogComment extends Struct.CollectionTypeSchema {
  collectionName: 'blog_comments';
  info: {
    description: 'B\u00ECnh lu\u1EADn b\u00E0i vi\u1EBFt blog (c\u00F3 ki\u1EC3m duy\u1EC7t)';
    displayName: 'C\u1ED9ng \u0110\u1ED3ng \u00B7 B\u00ECnh Lu\u1EADn Blog';
    pluralName: 'blog-comments';
    singularName: 'blog-comment';
  };
  options: {
    draftAndPublish: true;
    increments: true;
    timestamps: true;
  };
  attributes: {
    authorAvatar: Schema.Attribute.Media<'images'>;
    authorName: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    badge: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    content: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 2000;
        minLength: 2;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    ipHash: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 64;
      }>;
    isHidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    isOfficialReply: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    lastReportReason: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    likes: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::blog-comment.blog-comment'
    > &
      Schema.Attribute.Private;
    moderationStatus: Schema.Attribute.Enumeration<
      ['visible', 'flagged', 'hidden', 'removed']
    > &
      Schema.Attribute.DefaultTo<'visible'>;
    parent: Schema.Attribute.Relation<
      'manyToOne',
      'api::blog-comment.blog-comment'
    >;
    post: Schema.Attribute.Relation<'manyToOne', 'api::blog-post.blog-post'>;
    publishedAt: Schema.Attribute.DateTime;
    replies: Schema.Attribute.Relation<
      'oneToMany',
      'api::blog-comment.blog-comment'
    >;
    reportCount: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    spamScore: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    userId: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
  };
}

export interface ApiBlogPostBlogPost extends Struct.CollectionTypeSchema {
  collectionName: 'blog_posts';
  info: {
    description: 'B\u00E0i vi\u1EBFt Ph\u1EADt ph\u00E1p (Khai Th\u1ECB)';
    displayName: 'N\u1ED9i Dung \u00B7 B\u00E0i Vi\u1EBFt';
    pluralName: 'blog-posts';
    singularName: 'blog-post';
  };
  options: {
    draftAndPublish: true;
    increments: true;
    timestamps: true;
  };
  attributes: {
    allowComments: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    audio_url: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    categories: Schema.Attribute.Relation<
      'manyToMany',
      'api::category.category'
    >;
    commentCount: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    content: Schema.Attribute.RichText &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 10;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    eventDate: Schema.Attribute.Date;
    excerpt: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 300;
      }>;
    featured: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    gallery: Schema.Attribute.Media<'images', true>;
    likes: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::blog-post.blog-post'
    > &
      Schema.Attribute.Private;
    location: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    lunarEvents: Schema.Attribute.Relation<
      'manyToMany',
      'api::lunar-event.lunar-event'
    >;
    publishedAt: Schema.Attribute.DateTime;
    related_posts: Schema.Attribute.Relation<
      'manyToMany',
      'api::blog-post.blog-post'
    >;
    seo: Schema.Attribute.Component<'shared.seo', false>;
    seriesKey: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    seriesNumber: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    slug: Schema.Attribute.UID<'title'> &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    sourceName: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    sourceTitle: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    sourceUrl: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    tags: Schema.Attribute.Relation<'manyToMany', 'api::blog-tag.blog-tag'>;
    thumbnail: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
        minLength: 3;
      }>;
    unique_views: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    video_url: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    views: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
  };
}

export interface ApiBlogTagBlogTag extends Struct.CollectionTypeSchema {
  collectionName: 'blog_tags';
  info: {
    description: 'Searchable tags for blog posts (replaces JSON array)';
    displayName: 'N\u1ED9i Dung \u00B7 Th\u1EBB B\u00E0i Vi\u1EBFt';
    pluralName: 'blog-tags';
    singularName: 'blog-tag';
  };
  options: {
    draftAndPublish: false;
    increments: true;
    timestamps: true;
  };
  attributes: {
    blog_posts: Schema.Attribute.Relation<
      'manyToMany',
      'api::blog-post.blog-post'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 300;
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::blog-tag.blog-tag'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    publishedAt: Schema.Attribute.DateTime;
    slug: Schema.Attribute.UID<'name'> & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiCategoryCategory extends Struct.CollectionTypeSchema {
  collectionName: 'categories';
  info: {
    displayName: 'N\u1ED9i Dung \u00B7 Chuy\u00EAn M\u1EE5c';
    pluralName: 'categories';
    singularName: 'category';
  };
  options: {
    draftAndPublish: false;
    increments: true;
    timestamps: true;
  };
  attributes: {
    blog_posts: Schema.Attribute.Relation<
      'manyToMany',
      'api::blog-post.blog-post'
    >;
    children: Schema.Attribute.Relation<'oneToMany', 'api::category.category'>;
    color: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#6366f1'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String;
    is_active: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::category.category'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    parent: Schema.Attribute.Relation<'manyToOne', 'api::category.category'>;
    publishedAt: Schema.Attribute.DateTime;
    slug: Schema.Attribute.UID<'name'> &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiChantItemChantItem extends Struct.CollectionTypeSchema {
  collectionName: 'chant_items';
  info: {
    description: 'M\u1ED9t b\u00E0i ni\u1EC7m: kinh, ch\u00FA, nghi th\u1EE9c b\u01B0\u1EDBc \u2014 d\u00F9ng trong k\u1EBF ho\u1EA1ch ni\u1EC7m kinh';
    displayName: 'Ni\u1EC7m Kinh \u00B7 Danh M\u1EE5c B\u00E0i Ni\u1EC7m';
    pluralName: 'chant-items';
    singularName: 'chant-item';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    audio: Schema.Attribute.Media<'audios'>;
    content: Schema.Attribute.RichText;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    kind: Schema.Attribute.Enumeration<['step', 'sutra', 'mantra']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'mantra'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::chant-item.chant-item'
    > &
      Schema.Attribute.Private;
    openingPrayer: Schema.Attribute.RichText;
    publishedAt: Schema.Attribute.DateTime;
    recommendedPresets: Schema.Attribute.JSON;
    slug: Schema.Attribute.UID<'title'> & Schema.Attribute.Required;
    timeRules: Schema.Attribute.JSON;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiChantPlanChantPlan extends Struct.CollectionTypeSchema {
  collectionName: 'chant_plans';
  info: {
    description: 'K\u1EBF ho\u1EA1ch ni\u1EC7m kinh: daily (th\u01B0\u1EDDng nh\u1EADt) ho\u1EB7c special (\u0111\u1EB7c bi\u1EC7t)';
    displayName: 'Ni\u1EC7m Kinh \u00B7 L\u1ECBch Tr\u00ECnh Ni\u1EC7m';
    pluralName: 'chant-plans';
    singularName: 'chant-plan';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::chant-plan.chant-plan'
    > &
      Schema.Attribute.Private;
    planItems: Schema.Attribute.Component<'chanting.plan-item', true>;
    planType: Schema.Attribute.Enumeration<['daily', 'special']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'daily'>;
    publishedAt: Schema.Attribute.DateTime;
    slug: Schema.Attribute.UID<'title'> & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiCommunityCommentCommunityComment
  extends Struct.CollectionTypeSchema {
  collectionName: 'community_comments';
  info: {
    displayName: 'C\u1ED9ng \u0110\u1ED3ng \u00B7 B\u00ECnh Lu\u1EADn C\u0110';
    pluralName: 'community-comments';
    singularName: 'community-comment';
  };
  options: {
    draftAndPublish: true;
    increments: true;
    timestamps: true;
  };
  attributes: {
    author_avatar: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    author_name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    content: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 2000;
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    isHidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    lastReportReason: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    likes: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::community-comment.community-comment'
    > &
      Schema.Attribute.Private;
    moderationStatus: Schema.Attribute.Enumeration<
      ['visible', 'flagged', 'hidden', 'removed']
    > &
      Schema.Attribute.DefaultTo<'visible'>;
    parent: Schema.Attribute.Relation<
      'manyToOne',
      'api::community-comment.community-comment'
    >;
    post: Schema.Attribute.Relation<
      'manyToOne',
      'api::community-post.community-post'
    >;
    publishedAt: Schema.Attribute.DateTime;
    replies: Schema.Attribute.Relation<
      'oneToMany',
      'api::community-comment.community-comment'
    >;
    reportCount: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    spamScore: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiCommunityPostCommunityPost
  extends Struct.CollectionTypeSchema {
  collectionName: 'community_posts';
  info: {
    displayName: 'C\u1ED9ng \u0110\u1ED3ng \u00B7 B\u00E0i \u0110\u0103ng';
    pluralName: 'community-posts';
    singularName: 'community-post';
  };
  options: {
    draftAndPublish: true;
    increments: true;
    timestamps: true;
  };
  attributes: {
    author_avatar: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    author_country: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    author_name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    category: Schema.Attribute.Enumeration<
      [
        'S\u1EE9c Kho\u1EBB',
        'Gia \u0110\u00ECnh',
        'S\u1EF1 Nghi\u1EC7p',
        'H\u00F4n Nh\u00E2n',
        'T\u00E2m Linh',
        'Thi C\u1EED',
        'Kinh Doanh',
        'M\u1EA5t Ng\u1EE7',
        'M\u1ED1i Quan H\u1EC7',
        'Kh\u00E1c',
      ]
    > &
      Schema.Attribute.DefaultTo<'T\u00E2m Linh'>;
    comments: Schema.Attribute.Relation<
      'oneToMany',
      'api::community-comment.community-comment'
    >;
    content: Schema.Attribute.Text & Schema.Attribute.Required;
    cover_image: Schema.Attribute.Media<'images'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    isHidden: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    lastReportReason: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    likes: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::community-post.community-post'
    > &
      Schema.Attribute.Private;
    moderationStatus: Schema.Attribute.Enumeration<
      ['visible', 'flagged', 'hidden', 'removed']
    > &
      Schema.Attribute.DefaultTo<'visible'>;
    pinned: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    publishedAt: Schema.Attribute.DateTime;
    rating: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 5;
          min: 1;
        },
        number
      >;
    reportCount: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    slug: Schema.Attribute.UID<'title'> & Schema.Attribute.Required;
    spamScore: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    tags: Schema.Attribute.JSON;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 300;
      }>;
    type: Schema.Attribute.Enumeration<['story', 'feedback', 'video']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'story'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    video_url: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    views: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
  };
}

export interface ApiDownloadItemDownloadItem
  extends Struct.CollectionTypeSchema {
  collectionName: 'download_items';
  info: {
    description: 'Qu\u1EA3n l\u00FD link t\u1EA3i t\u00E0i li\u1EC7u (PDF, MP3, ZIP, Video) \u2014 internal & external';
    displayName: 'Th\u01B0 Vi\u1EC7n \u00B7 T\u00E0i Li\u1EC7u T\u1EA3i';
    pluralName: 'download-items';
    singularName: 'download-item';
  };
  options: {
    draftAndPublish: true;
    increments: true;
    timestamps: true;
  };
  attributes: {
    category: Schema.Attribute.Enumeration<
      [
        'Kinh \u0110i\u1EC3n',
        'Khai Th\u1ECB Audio',
        'Khai Th\u1ECB Video',
        'S\u00E1ch',
        'Ph\u00E1p H\u1ED9i',
        'H\u01B0\u1EDBng D\u1EABn',
        'Kh\u00E1c',
      ]
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'Kh\u00E1c'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 1000;
      }>;
    fileSizeMB: Schema.Attribute.Decimal;
    fileType: Schema.Attribute.Enumeration<
      ['pdf', 'mp3', 'mp4', 'zip', 'doc', 'epub', 'html', 'unknown']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'unknown'>;
    groupLabel: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    groupYear: Schema.Attribute.Integer;
    isNew: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    isUpdating: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::download-item.download-item'
    > &
      Schema.Attribute.Private;
    notes: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    publishedAt: Schema.Attribute.DateTime;
    sortOrder: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    thumbnail: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 300;
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 1000;
      }>;
  };
}

export interface ApiEventEvent extends Struct.CollectionTypeSchema {
  collectionName: 'events';
  info: {
    description: 'Qu\u1EA3n l\u00FD s\u1EF1 ki\u1EC7n, ph\u00E1p h\u1ED9i, ph\u00F3ng sinh t\u1EA1i Vi\u1EC7t Nam';
    displayName: 'N\u1ED9i Dung \u00B7 S\u1EF1 Ki\u1EC7n';
    pluralName: 'events';
    singularName: 'event';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    content: Schema.Attribute.RichText;
    coverImage: Schema.Attribute.Media<'images'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    date: Schema.Attribute.Date;
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    eventStatus: Schema.Attribute.Enumeration<['upcoming', 'live', 'past']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'upcoming'>;
    files: Schema.Attribute.Media<'files', true>;
    gallery: Schema.Attribute.Media<'images' | 'videos', true>;
    language: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Ti\u1EBFng Vi\u1EC7t'>;
    link: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::event.event'> &
      Schema.Attribute.Private;
    location: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'Vi\u1EC7t Nam'>;
    publishedAt: Schema.Attribute.DateTime;
    slug: Schema.Attribute.UID<'title'> & Schema.Attribute.Required;
    speaker: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'\u0110\u1ED9i ng\u0169 gi\u1EA3ng s\u01B0'>;
    timeString: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    type: Schema.Attribute.Enumeration<
      ['dharma-talk', 'webinar', 'retreat', 'liberation', 'festival']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'dharma-talk'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    youtubeId: Schema.Attribute.String;
  };
}

export interface ApiGalleryItemGalleryItem extends Struct.CollectionTypeSchema {
  collectionName: 'gallery_items';
  info: {
    description: 'Qu\u1EA3n l\u00FD th\u01B0 vi\u1EC7n \u1EA3nh ph\u00E1p m\u00F4n t\u00E2m linh hi\u1EC3n th\u1ECB t\u1EA1i route /gallery';
    displayName: 'Gallery \u00B7 \u1EA2nh T\u01B0 Li\u1EC7u';
    pluralName: 'gallery-items';
    singularName: 'gallery-item';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    album: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 120;
      }>;
    category: Schema.Attribute.Enumeration<
      [
        'Hoa Sen',
        'Ki\u1EBFn Tr\u00FAc',
        'Nghi L\u1EC5',
        'Ph\u00E1p H\u1ED9i',
        'Thi\u1EC1n \u0110\u1ECBnh',
        'Thi\u00EAn Nhi\u00EAn',
        'Kinh S\u00E1ch',
        'Ph\u1EADt T\u01B0\u1EE3ng',
        'Kh\u00E1c',
      ]
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'Kh\u00E1c'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 1200;
      }>;
    device: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 180;
      }>;
    featured: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    keywords: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 400;
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::gallery-item.gallery-item'
    > &
      Schema.Attribute.Private;
    location: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 180;
      }>;
    photographer: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 120;
      }> &
      Schema.Attribute.DefaultTo<'Ban Truy\u1EC1n Th\u00F4ng PMTL'>;
    publishedAt: Schema.Attribute.DateTime;
    quote: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    shotDate: Schema.Attribute.Date;
    slug: Schema.Attribute.UID<'title'> & Schema.Attribute.Required;
    sortOrder: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 220;
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiGuestbookEntryGuestbookEntry
  extends Struct.CollectionTypeSchema {
  collectionName: 'guestbook_entries';
  info: {
    description: 'Guestbook \u2014 l\u01B0u b\u00FAt t\u1EEB kh\u00E1ch th\u1EADp ph\u01B0\u01A1ng';
    displayName: 'C\u1ED9ng \u0110\u1ED3ng \u00B7 S\u1ED5 L\u01B0u B\u00FAt';
    pluralName: 'guestbook-entries';
    singularName: 'guestbook-entry';
  };
  options: {
    draftAndPublish: false;
    increments: true;
    timestamps: true;
  };
  attributes: {
    adminReply: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 2000;
      }>;
    approvalStatus: Schema.Attribute.Enumeration<['pending', 'approved']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'pending'>;
    authorName: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    avatar: Schema.Attribute.Media<'images'>;
    badge: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    country: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    entryType: Schema.Attribute.Enumeration<['message', 'question']> &
      Schema.Attribute.DefaultTo<'message'>;
    isAnswered: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    isOfficialReply: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::guestbook-entry.guestbook-entry'
    > &
      Schema.Attribute.Private;
    message: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 2000;
        minLength: 5;
      }>;
    month: Schema.Attribute.Integer;
    publishedAt: Schema.Attribute.DateTime;
    questionCategory: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    year: Schema.Attribute.Integer;
  };
}

export interface ApiHubPageHubPage extends Struct.CollectionTypeSchema {
  collectionName: 'hub_pages';
  info: {
    displayName: 'N\u1ED9i Dung \u00B7 Trang T\u1ED5ng H\u1EE3p';
    pluralName: 'hub-pages';
    singularName: 'hub-page';
  };
  options: {
    draftAndPublish: true;
    increments: true;
    timestamps: true;
  };
  attributes: {
    blocks: Schema.Attribute.DynamicZone<
      [
        'blocks.post-list-auto',
        'blocks.post-list-manual',
        'blocks.download-grid',
        'blocks.rich-text',
      ]
    >;
    coverImage: Schema.Attribute.Media<'images'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    curated_posts: Schema.Attribute.Relation<
      'manyToMany',
      'api::blog-post.blog-post'
    >;
    description: Schema.Attribute.Text;
    downloads: Schema.Attribute.Relation<
      'manyToMany',
      'api::download-item.download-item'
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::hub-page.hub-page'
    > &
      Schema.Attribute.Private;
    menuIcon: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    publishedAt: Schema.Attribute.DateTime;
    sections: Schema.Attribute.Component<'hub.hub-section', true>;
    showInMenu: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    slug: Schema.Attribute.UID<'title'> & Schema.Attribute.Required;
    sortOrder: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    visualTheme: Schema.Attribute.Enumeration<
      ['teaching', 'practice', 'story', 'reference']
    > &
      Schema.Attribute.DefaultTo<'teaching'>;
  };
}

export interface ApiLunarEventChantOverrideLunarEventChantOverride
  extends Struct.CollectionTypeSchema {
  collectionName: 'lunar_event_chant_overrides';
  info: {
    description: 'C\u1EA5u h\u00ECnh th\u00EAm/b\u1EDBt/ghi \u0111\u00E8 b\u00E0i ni\u1EC7m cho m\u1ED9t ng\u00E0y \u00E2m l\u1ECBch c\u1EE5 th\u1EC3';
    displayName: 'Ni\u1EC7m Kinh \u00B7 Gi\u1EDBi H\u1EA1n Ng\u00E0y \u0110B';
    pluralName: 'lunar-event-chant-overrides';
    singularName: 'lunar-event-chant-override';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    item: Schema.Attribute.Relation<'manyToOne', 'api::chant-item.chant-item'> &
      Schema.Attribute.Required;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::lunar-event-chant-override.lunar-event-chant-override'
    > &
      Schema.Attribute.Private;
    lunarEvent: Schema.Attribute.Relation<
      'manyToOne',
      'api::lunar-event.lunar-event'
    > &
      Schema.Attribute.Required;
    max: Schema.Attribute.Integer;
    mode: Schema.Attribute.Enumeration<
      ['enable', 'disable', 'override_target', 'cap_max']
    > &
      Schema.Attribute.Required;
    note: Schema.Attribute.String;
    priority: Schema.Attribute.Integer;
    publishedAt: Schema.Attribute.DateTime;
    target: Schema.Attribute.Integer;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiLunarEventLunarEvent extends Struct.CollectionTypeSchema {
  collectionName: 'lunar_events';
  info: {
    description: 'L\u1ECBch ni\u1EC7m L\u1EC5 Ph\u1EADt \u0110\u1EA1i S\u00E1m H\u1ED1i V\u0103n, khai th\u1ECB v\u00E0 c\u00E1c ng\u00E0y v\u00EDa';
    displayName: 'Ni\u1EC7m Kinh \u00B7 L\u1ECBch S\u1EF1 Ki\u1EC7n \u00C2m';
    pluralName: 'lunar-events';
    singularName: 'lunar-event';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    eventType: Schema.Attribute.Enumeration<
      ['buddha', 'bodhisattva', 'teacher', 'fast', 'holiday', 'normal']
    > &
      Schema.Attribute.DefaultTo<'normal'>;
    isRecurringLunar: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::lunar-event.lunar-event'
    > &
      Schema.Attribute.Private;
    lunarDay: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 30;
          min: 1;
        },
        number
      >;
    lunarMonth: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 12;
          min: 1;
        },
        number
      >;
    publishedAt: Schema.Attribute.DateTime;
    relatedBlogs: Schema.Attribute.Relation<
      'manyToMany',
      'api::blog-post.blog-post'
    >;
    solarDate: Schema.Attribute.Date;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiPracticeLogPracticeLog extends Struct.CollectionTypeSchema {
  collectionName: 'practice_logs';
  info: {
    description: 'L\u01B0u ti\u1EBFn \u0111\u1ED9 ni\u1EC7m kinh theo ng\u00E0y + ng\u01B0\u1EDDi d\u00F9ng';
    displayName: 'Ni\u1EC7m Kinh \u00B7 Nh\u1EADt K\u00FD Tu H\u1ECDc';
    pluralName: 'practice-logs';
    singularName: 'practice-log';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    completedAt: Schema.Attribute.DateTime;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    date: Schema.Attribute.Date & Schema.Attribute.Required;
    isCompleted: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    itemsProgress: Schema.Attribute.JSON;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::practice-log.practice-log'
    > &
      Schema.Attribute.Private;
    plan: Schema.Attribute.Relation<'manyToOne', 'api::chant-plan.chant-plan'>;
    publishedAt: Schema.Attribute.DateTime;
    startedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    > &
      Schema.Attribute.Required;
  };
}

export interface ApiPushJobPushJob extends Struct.CollectionTypeSchema {
  collectionName: 'push_jobs';
  info: {
    description: 'L\u01B0u l\u1EA1i t\u1EEBng \u0111\u1EE3t th\u00F4ng b\u00E1o \u0111\u1EC3 web v\u00E0 thi\u1EBFt b\u1ECB c\u00F9ng \u0111\u1ECDc chung m\u1ED9t ngu\u1ED3n';
    displayName: 'Th\u00F4ng B\u00E1o \u00B7 Nh\u1EADt K\u00FD \u0110\u00E3 G\u1EEDi';
    pluralName: 'push-jobs';
    singularName: 'push-job';
  };
  options: {
    draftAndPublish: false;
    increments: true;
    timestamps: true;
  };
  attributes: {
    body: Schema.Attribute.Text & Schema.Attribute.Required;
    chunkSize: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 500;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<100>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    cursor: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    failedCount: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    finishedAt: Schema.Attribute.DateTime;
    invalidCount: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    kind: Schema.Attribute.Enumeration<
      [
        'daily_chant',
        'broadcast',
        'content_update',
        'event_reminder',
        'community',
      ]
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'daily_chant'>;
    lastError: Schema.Attribute.Text;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::push-job.push-job'
    > &
      Schema.Attribute.Private;
    payload: Schema.Attribute.JSON;
    processedCount: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    publishedAt: Schema.Attribute.DateTime;
    startedAt: Schema.Attribute.DateTime;
    status: Schema.Attribute.Enumeration<
      ['pending', 'processing', 'completed', 'failed']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'pending'>;
    successCount: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    tag: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    targetedCount: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 150;
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
  };
}

export interface ApiPushSubscriptionPushSubscription
  extends Struct.CollectionTypeSchema {
  collectionName: 'push_subscriptions';
  info: {
    description: 'M\u1ED7i d\u00F2ng l\u00E0 m\u1ED9t thi\u1EBFt b\u1ECB \u0111\u00E3 b\u1EADt nh\u1EADn th\u00F4ng b\u00E1o tr\u00EAn web';
    displayName: 'Thi\u1EBFt B\u1ECB \u00B7 \u0110\u0103ng K\u00FD Nh\u1EADn Th\u00F4ng B\u00E1o';
    pluralName: 'push-subscriptions';
    singularName: 'push-subscription';
  };
  options: {
    draftAndPublish: false;
    increments: true;
    timestamps: true;
  };
  attributes: {
    auth: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    endpoint: Schema.Attribute.Text & Schema.Attribute.Required;
    failedCount: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    lastError: Schema.Attribute.Text;
    lastSentAt: Schema.Attribute.DateTime;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::push-subscription.push-subscription'
    > &
      Schema.Attribute.Private;
    notificationTypes: Schema.Attribute.JSON;
    p256dh: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    publishedAt: Schema.Attribute.DateTime;
    quietHoursEnd: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 23;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<6>;
    quietHoursStart: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 23;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<22>;
    reminderHour: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 23;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<6>;
    reminderMinute: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 59;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    timezone: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }> &
      Schema.Attribute.DefaultTo<'Asia/Ho_Chi_Minh'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiSettingSetting extends Struct.SingleTypeSchema {
  collectionName: 'settings';
  info: {
    description: 'C\u00E0i \u0111\u1EB7t chung v\u00E0 n\u1ED9i dung trang ch\u1EE7';
    displayName: 'C\u1EA5u H\u00ECnh \u00B7 H\u1EC7 Th\u1ED1ng Trang Ch\u1EE7';
    pluralName: 'settings';
    singularName: 'setting';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    actionCards: Schema.Attribute.Component<'homepage.action-card-item', true>;
    address: Schema.Attribute.Text;
    awards: Schema.Attribute.Component<'homepage.award-item', true>;
    contactEmail: Schema.Attribute.Email;
    contactPhone: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 20;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    featuredVideos: Schema.Attribute.Component<'homepage.featured-video', true>;
    footerText: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        'plugin::ckeditor5.CKEditor',
        {
          preset: 'pmtl-html';
        }
      >;
    gallerySlides: Schema.Attribute.Component<'homepage.gallery-slide', true>;
    heroSlides: Schema.Attribute.Component<'homepage.hero-slide', true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::setting.setting'
    > &
      Schema.Attribute.Private;
    logo: Schema.Attribute.Media<'images'>;
    phapBao: Schema.Attribute.Component<'homepage.phap-bao-item', true>;
    publishedAt: Schema.Attribute.DateTime;
    siteDescription: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'Trang th\u00F4ng tin Ph\u1EADt ph\u00E1p v\u00E0 tu t\u1EADp'>;
    siteTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'Ph\u00E1p M\u00F4n T\u00E2m Linh'>;
    socialLinks: Schema.Attribute.JSON;
    stats: Schema.Attribute.Component<'homepage.stat-item', true>;
    stickyBanner: Schema.Attribute.Component<'homepage.sticky-banner', false>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiSidebarConfigSidebarConfig extends Struct.SingleTypeSchema {
  collectionName: 'sidebar_configs';
  info: {
    displayName: 'C\u1EA5u H\u00ECnh \u00B7 Thanh B\u00EAn';
    pluralName: 'sidebar-configs';
    singularName: 'sidebar-config';
  };
  options: {
    draftAndPublish: false;
    increments: true;
    timestamps: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    downloadLinks: Schema.Attribute.Component<'shared.quick-link', true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::sidebar-config.sidebar-config'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    qrImages: Schema.Attribute.Media<'images', true>;
    showArchive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    showCategoryTree: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    showDownloadLinks: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    showLatestComments: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    showSearch: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    socialLinks: Schema.Attribute.Component<'shared.social-link', true>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiSutraBookmarkSutraBookmark
  extends Struct.CollectionTypeSchema {
  collectionName: 'sutra_bookmarks';
  info: {
    description: '\u0110\u00E1nh d\u1EA5u \u0111o\u1EA1n \u0111\u1ECDc c\u1EE7a t\u1EEBng user';
    displayName: 'Kinh \u0110i\u1EC3n \u00B7 Bookmark';
    pluralName: 'sutra-bookmarks';
    singularName: 'sutra-bookmark';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    anchorKey: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 80;
      }>;
    chapter: Schema.Attribute.Relation<
      'manyToOne',
      'api::sutra-chapter.sutra-chapter'
    > &
      Schema.Attribute.Required;
    charOffset: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    excerpt: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 800;
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::sutra-bookmark.sutra-bookmark'
    > &
      Schema.Attribute.Private;
    note: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 2000;
      }>;
    publishedAt: Schema.Attribute.DateTime;
    sutra: Schema.Attribute.Relation<'manyToOne', 'api::sutra.sutra'> &
      Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    > &
      Schema.Attribute.Required;
    volume: Schema.Attribute.Relation<
      'manyToOne',
      'api::sutra-volume.sutra-volume'
    >;
  };
}

export interface ApiSutraChapterSutraChapter
  extends Struct.CollectionTypeSchema {
  collectionName: 'sutra_chapters';
  info: {
    description: 'N\u1ED9i dung t\u1EEBng ph\u1EA9m/\u0111o\u1EA1n trong m\u1ED9t t\u1EADp kinh';
    displayName: 'Kinh \u0110i\u1EC3n \u00B7 Ph\u1EA9m';
    pluralName: 'sutra-chapters';
    singularName: 'sutra-chapter';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    chapterNumber: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    content: Schema.Attribute.Text & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    endingText: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 1200;
      }>;
    estimatedReadMinutes: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<5>;
    glossaries: Schema.Attribute.Relation<
      'oneToMany',
      'api::sutra-glossary.sutra-glossary'
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::sutra-chapter.sutra-chapter'
    > &
      Schema.Attribute.Private;
    openingText: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 1200;
      }>;
    publishedAt: Schema.Attribute.DateTime;
    slug: Schema.Attribute.UID<'title'> & Schema.Attribute.Required;
    sortOrder: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    sutra: Schema.Attribute.Relation<'manyToOne', 'api::sutra.sutra'> &
      Schema.Attribute.Required;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 260;
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    volume: Schema.Attribute.Relation<
      'manyToOne',
      'api::sutra-volume.sutra-volume'
    > &
      Schema.Attribute.Required;
  };
}

export interface ApiSutraGlossarySutraGlossary
  extends Struct.CollectionTypeSchema {
  collectionName: 'sutra_glossaries';
  info: {
    description: 'Gi\u1EA3i th\u00EDch thu\u1EADt ng\u1EEF/marker trong n\u1ED9i dung kinh';
    displayName: 'Kinh \u0110i\u1EC3n \u00B7 Th\u00EDch Ngh\u0129a';
    pluralName: 'sutra-glossaries';
    singularName: 'sutra-glossary';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    chapter: Schema.Attribute.Relation<
      'manyToOne',
      'api::sutra-chapter.sutra-chapter'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::sutra-glossary.sutra-glossary'
    > &
      Schema.Attribute.Private;
    markerKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    meaning: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 2000;
      }>;
    publishedAt: Schema.Attribute.DateTime;
    sortOrder: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    sutra: Schema.Attribute.Relation<'manyToOne', 'api::sutra.sutra'> &
      Schema.Attribute.Required;
    term: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 180;
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    volume: Schema.Attribute.Relation<
      'manyToOne',
      'api::sutra-volume.sutra-volume'
    >;
  };
}

export interface ApiSutraReadingProgressSutraReadingProgress
  extends Struct.CollectionTypeSchema {
  collectionName: 'sutra_reading_progresses';
  info: {
    description: 'L\u01B0u v\u1ECB tr\u00ED \u0111\u1ECDc theo user v\u00E0 t\u1EEBng ph\u1EA9m';
    displayName: 'Kinh \u0110i\u1EC3n \u00B7 Ti\u1EBFn \u0110\u1ED9 \u0110\u1ECDc';
    pluralName: 'sutra-reading-progresses';
    singularName: 'sutra-reading-progress';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    anchorKey: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 80;
      }>;
    chapter: Schema.Attribute.Relation<
      'manyToOne',
      'api::sutra-chapter.sutra-chapter'
    > &
      Schema.Attribute.Required;
    charOffset: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    lastReadAt: Schema.Attribute.DateTime;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::sutra-reading-progress.sutra-reading-progress'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    scrollPercent: Schema.Attribute.Float &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    sutra: Schema.Attribute.Relation<'manyToOne', 'api::sutra.sutra'> &
      Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    > &
      Schema.Attribute.Required;
    volume: Schema.Attribute.Relation<
      'manyToOne',
      'api::sutra-volume.sutra-volume'
    >;
  };
}

export interface ApiSutraVolumeSutraVolume extends Struct.CollectionTypeSchema {
  collectionName: 'sutra_volumes';
  info: {
    description: 'M\u1ED7i t\u1EADp thu\u1ED9c m\u1ED9t b\u1ED9 kinh';
    displayName: 'Kinh \u0110i\u1EC3n \u00B7 T\u1EADp/Quy\u1EC3n';
    pluralName: 'sutra-volumes';
    singularName: 'sutra-volume';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    bookEnd: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    bookStart: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    chapters: Schema.Attribute.Relation<
      'oneToMany',
      'api::sutra-chapter.sutra-chapter'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 800;
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::sutra-volume.sutra-volume'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    slug: Schema.Attribute.UID<'title'> & Schema.Attribute.Required;
    sortOrder: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    sutra: Schema.Attribute.Relation<'manyToOne', 'api::sutra.sutra'> &
      Schema.Attribute.Required;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 240;
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    volumeNumber: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
  };
}

export interface ApiSutraSutra extends Struct.CollectionTypeSchema {
  collectionName: 'sutras';
  info: {
    description: 'Th\u00F4ng tin t\u1ED5ng quan c\u1EE7a m\u1ED9t b\u1ED9 kinh \u0111\u1EA1i th\u1EEBa';
    displayName: 'Kinh \u0110i\u1EC3n \u00B7 B\u1ED9 Kinh';
    pluralName: 'sutras';
    singularName: 'sutra';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    coverImage: Schema.Attribute.Media<'images'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 1200;
      }>;
    glossaries: Schema.Attribute.Relation<
      'oneToMany',
      'api::sutra-glossary.sutra-glossary'
    >;
    isFeatured: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::sutra.sutra'> &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    reviewer: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    shortExcerpt: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 360;
      }>;
    slug: Schema.Attribute.UID<'title'> & Schema.Attribute.Required;
    sortOrder: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    tags: Schema.Attribute.Relation<'manyToMany', 'api::blog-tag.blog-tag'>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 260;
      }>;
    translatorHan: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    translatorViet: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    volumes: Schema.Attribute.Relation<
      'oneToMany',
      'api::sutra-volume.sutra-volume'
    >;
  };
}

export interface PluginContentReleasesRelease
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_releases';
  info: {
    displayName: 'Release';
    pluralName: 'releases';
    singularName: 'release';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    actions: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release-action'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    releasedAt: Schema.Attribute.DateTime;
    scheduledAt: Schema.Attribute.DateTime;
    status: Schema.Attribute.Enumeration<
      ['ready', 'blocked', 'failed', 'done', 'empty']
    > &
      Schema.Attribute.Required;
    timezone: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginContentReleasesReleaseAction
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_release_actions';
  info: {
    displayName: 'Release Action';
    pluralName: 'release-actions';
    singularName: 'release-action';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentType: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    entryDocumentId: Schema.Attribute.String;
    isEntryValid: Schema.Attribute.Boolean;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release-action'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    release: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::content-releases.release'
    >;
    type: Schema.Attribute.Enumeration<['publish', 'unpublish']> &
      Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginI18NLocale extends Struct.CollectionTypeSchema {
  collectionName: 'i18n_locale';
  info: {
    collectionName: 'locales';
    description: '';
    displayName: 'Locale';
    pluralName: 'locales';
    singularName: 'locale';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Schema.Attribute.String & Schema.Attribute.Unique;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::i18n.locale'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.SetMinMax<
        {
          max: 50;
          min: 1;
        },
        number
      >;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginReviewWorkflowsWorkflow
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_workflows';
  info: {
    description: '';
    displayName: 'Workflow';
    name: 'Workflow';
    pluralName: 'workflows';
    singularName: 'workflow';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentTypes: Schema.Attribute.JSON &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'[]'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    stageRequiredToPublish: Schema.Attribute.Relation<
      'oneToOne',
      'plugin::review-workflows.workflow-stage'
    >;
    stages: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow-stage'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginReviewWorkflowsWorkflowStage
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_workflows_stages';
  info: {
    description: '';
    displayName: 'Stages';
    name: 'Workflow Stage';
    pluralName: 'workflow-stages';
    singularName: 'workflow-stage';
  };
  options: {
    draftAndPublish: false;
    version: '1.1.0';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    color: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#4945FF'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow-stage'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String;
    permissions: Schema.Attribute.Relation<'manyToMany', 'admin::permission'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    workflow: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::review-workflows.workflow'
    >;
  };
}

export interface PluginUploadFile extends Struct.CollectionTypeSchema {
  collectionName: 'files';
  info: {
    description: '';
    displayName: 'File';
    pluralName: 'files';
    singularName: 'file';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    alternativeText: Schema.Attribute.Text;
    caption: Schema.Attribute.Text;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    ext: Schema.Attribute.String;
    focalPoint: Schema.Attribute.JSON;
    folder: Schema.Attribute.Relation<'manyToOne', 'plugin::upload.folder'> &
      Schema.Attribute.Private;
    folderPath: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    formats: Schema.Attribute.JSON;
    hash: Schema.Attribute.String & Schema.Attribute.Required;
    height: Schema.Attribute.Integer;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::upload.file'
    > &
      Schema.Attribute.Private;
    mime: Schema.Attribute.String & Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    previewUrl: Schema.Attribute.Text;
    provider: Schema.Attribute.String & Schema.Attribute.Required;
    provider_metadata: Schema.Attribute.JSON;
    publishedAt: Schema.Attribute.DateTime;
    related: Schema.Attribute.Relation<'morphToMany'>;
    size: Schema.Attribute.Decimal & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url: Schema.Attribute.Text & Schema.Attribute.Required;
    width: Schema.Attribute.Integer;
  };
}

export interface PluginUploadFolder extends Struct.CollectionTypeSchema {
  collectionName: 'upload_folders';
  info: {
    displayName: 'Folder';
    pluralName: 'folders';
    singularName: 'folder';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    children: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.folder'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    files: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.file'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::upload.folder'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    parent: Schema.Attribute.Relation<'manyToOne', 'plugin::upload.folder'>;
    path: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    pathId: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    role: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'role';
    pluralName: 'roles';
    singularName: 'role';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.role'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    type: Schema.Attribute.String & Schema.Attribute.Unique;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    users: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.user'
    >;
  };
}

export interface PluginUsersPermissionsUser
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_users';
  info: {
    description: '';
    displayName: 'User';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
    timestamps: true;
  };
  attributes: {
    address: Schema.Attribute.String;
    avatar_url: Schema.Attribute.Media<'images'>;
    bio: Schema.Attribute.Text;
    blocked: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    confirmationToken: Schema.Attribute.String & Schema.Attribute.Private;
    confirmed: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    dharmaName: Schema.Attribute.String;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    fullName: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.user'
    > &
      Schema.Attribute.Private;
    password: Schema.Attribute.Password &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    phone: Schema.Attribute.String;
    provider: Schema.Attribute.String & Schema.Attribute.DefaultTo<'local'>;
    publishedAt: Schema.Attribute.DateTime;
    resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private;
    role: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    username: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ContentTypeSchemas {
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::permission': AdminPermission;
      'admin::role': AdminRole;
      'admin::session': AdminSession;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'admin::user': AdminUser;
      'api::beginner-guide.beginner-guide': ApiBeginnerGuideBeginnerGuide;
      'api::blog-comment.blog-comment': ApiBlogCommentBlogComment;
      'api::blog-post.blog-post': ApiBlogPostBlogPost;
      'api::blog-tag.blog-tag': ApiBlogTagBlogTag;
      'api::category.category': ApiCategoryCategory;
      'api::chant-item.chant-item': ApiChantItemChantItem;
      'api::chant-plan.chant-plan': ApiChantPlanChantPlan;
      'api::community-comment.community-comment': ApiCommunityCommentCommunityComment;
      'api::community-post.community-post': ApiCommunityPostCommunityPost;
      'api::download-item.download-item': ApiDownloadItemDownloadItem;
      'api::event.event': ApiEventEvent;
      'api::gallery-item.gallery-item': ApiGalleryItemGalleryItem;
      'api::guestbook-entry.guestbook-entry': ApiGuestbookEntryGuestbookEntry;
      'api::hub-page.hub-page': ApiHubPageHubPage;
      'api::lunar-event-chant-override.lunar-event-chant-override': ApiLunarEventChantOverrideLunarEventChantOverride;
      'api::lunar-event.lunar-event': ApiLunarEventLunarEvent;
      'api::practice-log.practice-log': ApiPracticeLogPracticeLog;
      'api::push-job.push-job': ApiPushJobPushJob;
      'api::push-subscription.push-subscription': ApiPushSubscriptionPushSubscription;
      'api::setting.setting': ApiSettingSetting;
      'api::sidebar-config.sidebar-config': ApiSidebarConfigSidebarConfig;
      'api::sutra-bookmark.sutra-bookmark': ApiSutraBookmarkSutraBookmark;
      'api::sutra-chapter.sutra-chapter': ApiSutraChapterSutraChapter;
      'api::sutra-glossary.sutra-glossary': ApiSutraGlossarySutraGlossary;
      'api::sutra-reading-progress.sutra-reading-progress': ApiSutraReadingProgressSutraReadingProgress;
      'api::sutra-volume.sutra-volume': ApiSutraVolumeSutraVolume;
      'api::sutra.sutra': ApiSutraSutra;
      'plugin::content-releases.release': PluginContentReleasesRelease;
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction;
      'plugin::i18n.locale': PluginI18NLocale;
      'plugin::review-workflows.workflow': PluginReviewWorkflowsWorkflow;
      'plugin::review-workflows.workflow-stage': PluginReviewWorkflowsWorkflowStage;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
    }
  }
}
