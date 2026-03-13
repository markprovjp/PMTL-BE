/**
 * AUTO-GENERATED TYPE DEFINITIONS
 * Do not edit manually!
 * Regenerate: npm run build
 */

import type { StrapiMediaRef } from './media'

export interface AuditLog {
  id?: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  action: unknown;
  targetUid: string;
  targetDocumentId?: string;
  targetId?: number;
  targetLabel?: string;
  actorType: unknown;
  actorId?: number;
  actorDisplayName?: string;
  actorEmail?: unknown;
  requestMethod?: string;
  requestPath?: string;
  requestId?: string;
  ipHash?: string;
  userAgent?: string;
  changedFields?: Record<string, any>;
  metadata?: Record<string, any>;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: AuditLog[];
}

export interface BeginnerGuide {
  id?: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  description?: string;
  content?: string;
  details?: Record<string, any>;
  duration?: string;
  order?: number;
  step_number?: number;
  guide_type: unknown;
  icon?: UiIcon | null;
  pdf_url?: string;
  video_url?: string;
  images?: StrapiMediaRef | null;
  attached_files?: StrapiMediaRef | null;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: BeginnerGuide[];
}

export interface BlogComment {
  id?: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  post?: BlogPost | null;
  authorName: string;
  authorAvatar?: StrapiMediaRef | null;
  userId?: string;
  content: string;
  parent?: BlogComment | null;
  replies?: BlogComment[];
  likes?: number;
  isOfficialReply?: boolean;
  badge?: string;
  user?: any;
  ipHash?: string;
  moderationStatus?: unknown;
  reportCount?: number;
  lastReportReason?: string;
  isHidden?: boolean;
  spamScore?: number;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: BlogComment[];
}

export interface BlogPost {
  id?: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  slug: unknown;
  content: string;
  excerpt?: string;
  thumbnail?: StrapiMediaRef | null;
  gallery?: StrapiMediaRef | null;
  video_url?: string;
  audio_url?: string;
  oembed?: Record<string, any>;
  categories?: Category[];
  tags?: BlogTag[];
  featured?: boolean;
  views?: number;
  unique_views?: number;
  likes?: number;
  seo?: any;
  related_posts?: BlogPost[];
  lunarEvents?: LunarEvent[];
  seriesKey?: string;
  seriesNumber?: number;
  sourceName?: string;
  sourceUrl?: string;
  sourceTitle?: string;
  allowComments?: boolean;
  commentCount?: number;
  eventDate?: string;
  location?: string;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: BlogPost[];
}

export interface BlogTag {
  id?: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  slug: unknown;
  description?: string;
  blog_posts?: BlogPost[];
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: BlogTag[];
}

export interface Category {
  id?: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  slug: unknown;
  description?: string;
  color?: string;
  order?: number;
  is_active?: boolean;
  parent?: Category | null;
  children?: Category[];
  blog_posts?: BlogPost[];
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: Category[];
}

export interface ChantItem {
  id?: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  slug: unknown;
  kind: unknown;
  content?: string;
  openingPrayer?: string;
  timeRules?: Record<string, any>;
  recommendedPresets?: Record<string, any>;
  audio?: StrapiMediaRef | null;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: ChantItem[];
}

export interface ChantPlan {
  id?: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  slug: unknown;
  planType: unknown;
  planItems?: any[];
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: ChantPlan[];
}

export interface CommunityComment {
  id?: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  content: string;
  author_name: string;
  author_avatar?: string;
  user?: any;
  post?: CommunityPost | null;
  likes?: number;
  parent?: CommunityComment | null;
  replies?: CommunityComment[];
  moderationStatus?: unknown;
  reportCount?: number;
  lastReportReason?: string;
  isHidden?: boolean;
  spamScore?: number;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: CommunityComment[];
}

export interface CommunityPost {
  id?: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  slug: unknown;
  content: string;
  type: unknown;
  category?: unknown;
  cover_image?: StrapiMediaRef | null;
  video_url?: string;
  author_name: string;
  author_avatar?: string;
  author_country?: string;
  user?: any;
  likes?: number;
  views?: number;
  comments?: CommunityComment[];
  tags?: Record<string, any>;
  rating?: number;
  pinned?: boolean;
  moderationStatus?: unknown;
  reportCount?: number;
  lastReportReason?: string;
  isHidden?: boolean;
  spamScore?: number;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: CommunityPost[];
}

export interface ContentHistory {
  id?: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  targetUid: string;
  targetDocumentId: string;
  targetId?: number;
  targetLabel?: string;
  action: unknown;
  versionNumber: number;
  actorType: unknown;
  actorId?: number;
  actorDisplayName?: string;
  actorEmail?: unknown;
  changedFields?: Record<string, any>;
  snapshot: Record<string, any>;
  metadata?: Record<string, any>;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: ContentHistory[];
}

export interface DownloadItem {
  id?: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  description?: string;
  url: string;
  fileType: unknown;
  category: unknown;
  groupYear?: number;
  groupLabel?: string;
  notes?: string;
  isUpdating?: boolean;
  isNew?: boolean;
  sortOrder?: number;
  thumbnail?: StrapiMediaRef | null;
  fileSizeMB?: number;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: DownloadItem[];
}

export interface Event {
  id?: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  slug: unknown;
  description: string;
  content?: string;
  date?: string;
  timeString?: string;
  location: string;
  type: unknown;
  eventStatus: unknown;
  speaker?: string;
  language?: string;
  link?: string;
  youtubeId?: string;
  oembed?: Record<string, any>;
  coverImage?: StrapiMediaRef | null;
  gallery?: StrapiMediaRef | null;
  files?: StrapiMediaRef | null;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: Event[];
}

export interface GalleryItem {
  id?: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  slug: unknown;
  description?: string;
  quote?: string;
  category: unknown;
  album?: string;
  location?: string;
  device?: string;
  photographer?: string;
  shotDate?: string;
  image: StrapiMediaRef | null;
  featured?: boolean;
  sortOrder?: number;
  keywords?: string;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: GalleryItem[];
}

export interface GuestbookEntry {
  id?: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  authorName: string;
  country?: string;
  avatar?: StrapiMediaRef | null;
  message: string;
  adminReply?: string;
  approvalStatus: unknown;
  isOfficialReply?: boolean;
  badge?: string;
  year?: number;
  month?: number;
  entryType?: unknown;
  questionCategory?: string;
  isAnswered?: boolean;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: GuestbookEntry[];
}

export interface HubPage {
  id?: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  slug: unknown;
  description?: string;
  coverImage?: StrapiMediaRef | null;
  sections?: any[];
  curated_posts?: BlogPost[];
  downloads?: DownloadItem[];
  sortOrder?: number;
  showInMenu?: boolean;
  menuIcon?: UiIcon | null;
  visualTheme?: unknown;
  blocks?: unknown;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: HubPage[];
}

export interface LunarEvent {
  id?: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  isRecurringLunar?: boolean;
  lunarMonth?: number;
  lunarDay?: number;
  solarDate?: string;
  eventType?: unknown;
  relatedBlogs?: BlogPost[];
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: LunarEvent[];
}

export interface LunarEventChantOverride {
  id?: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  lunarEvent: LunarEvent | null;
  item: ChantItem | null;
  mode: unknown;
  target?: number;
  max?: number;
  priority?: number;
  note?: string;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: LunarEventChantOverride[];
}

export interface PracticeLog {
  id?: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  user: any;
  plan?: ChantPlan | null;
  date: string;
  itemsProgress?: Record<string, any>;
  startedAt?: string;
  completedAt?: string;
  isCompleted?: boolean;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: PracticeLog[];
}

export interface PushJob {
  id?: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  kind: unknown;
  status: unknown;
  title: string;
  body: string;
  url?: string;
  tag?: string;
  payload?: Record<string, any>;
  cursor?: number;
  chunkSize?: number;
  targetedCount?: number;
  processedCount?: number;
  successCount?: number;
  failedCount?: number;
  invalidCount?: number;
  lastError?: string;
  startedAt?: string;
  finishedAt?: string;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: PushJob[];
}

export interface PushSubscription {
  id?: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  reminderHour?: number;
  reminderMinute?: number;
  user?: any;
  timezone?: string;
  isActive?: boolean;
  lastSentAt?: string;
  lastError?: string;
  failedCount?: number;
  notificationTypes?: Record<string, any>;
  quietHoursStart?: number;
  quietHoursEnd?: number;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: PushSubscription[];
}

export interface RequestGuard {
  id?: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  guardKey: string;
  scope: string;
  hits?: number;
  expiresAt: string;
  lastSeenAt: string;
  notes?: Record<string, any>;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: RequestGuard[];
}

export interface Setting {
  id?: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  siteTitle: string;
  siteDescription: string;
  logo?: StrapiMediaRef | null;
  socialLinks?: Record<string, any>;
  contactEmail?: unknown;
  contactPhone?: string;
  address?: string;
  footerText?: string;
  heroSlides?: any[];
  stats?: any[];
  phapBao?: any[];
  actionCards?: any[];
  featuredVideos?: any[];
  awards?: any[];
  gallerySlides?: any[];
  stickyBanner?: any;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: Setting[];
}

export interface SidebarConfig {
  id?: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  showSearch?: boolean;
  showCategoryTree?: boolean;
  showArchive?: boolean;
  showLatestComments?: boolean;
  showDownloadLinks?: boolean;
  downloadLinks?: any[];
  socialLinks?: any[];
  qrImages?: StrapiMediaRef | null;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: SidebarConfig[];
}

export interface Sutra {
  id?: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  slug: unknown;
  description?: string;
  shortExcerpt?: string;
  coverImage?: StrapiMediaRef | null;
  translatorHan?: string;
  translatorViet?: string;
  reviewer?: string;
  tags?: BlogTag[];
  volumes?: SutraVolume[];
  glossaries?: SutraGlossary[];
  isFeatured?: boolean;
  sortOrder?: number;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: Sutra[];
}

export interface SutraBookmark {
  id?: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  user: any;
  sutra: Sutra | null;
  volume?: SutraVolume | null;
  chapter: SutraChapter | null;
  anchorKey?: string;
  charOffset?: number;
  excerpt?: string;
  note?: string;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: SutraBookmark[];
}

export interface SutraChapter {
  id?: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  slug: unknown;
  chapterNumber: number;
  openingText?: string;
  content: string;
  endingText?: string;
  estimatedReadMinutes?: number;
  sortOrder?: number;
  sutra: Sutra | null;
  volume: SutraVolume | null;
  glossaries?: SutraGlossary[];
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: SutraChapter[];
}

export interface SutraGlossary {
  id?: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  markerKey: string;
  term: string;
  meaning: string;
  sortOrder?: number;
  sutra: Sutra | null;
  volume?: SutraVolume | null;
  chapter?: SutraChapter | null;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: SutraGlossary[];
}

export interface SutraReadingProgress {
  id?: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  user: any;
  sutra: Sutra | null;
  volume?: SutraVolume | null;
  chapter: SutraChapter | null;
  anchorKey?: string;
  charOffset?: number;
  scrollPercent?: number;
  lastReadAt?: string;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: SutraReadingProgress[];
}

export interface SutraVolume {
  id?: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  slug: unknown;
  volumeNumber: number;
  bookStart?: number;
  bookEnd?: number;
  description?: string;
  sutra: Sutra | null;
  chapters?: SutraChapter[];
  sortOrder?: number;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: SutraVolume[];
}

export interface UiIcon {
  id?: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  key: unknown;
  lucideName: string;
  category?: unknown;
  notes?: string;
  isActive?: boolean;
  sortOrder?: number;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: UiIcon[];
}
