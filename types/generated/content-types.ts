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
  uuid?: unknown;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: AuditLog[];
  _softDeletedAt?: string;
  _softDeletedById?: number;
  _softDeletedByType?: string;
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
  icon?: string;
  pdf_url?: string;
  video_url?: string;
  images?: StrapiMediaRef | null;
  attached_files?: StrapiMediaRef | null;
  uuid?: unknown;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: BeginnerGuide[];
  _softDeletedAt?: string;
  _softDeletedById?: number;
  _softDeletedByType?: string;
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
  uuid?: unknown;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: BlogComment[];
  _softDeletedAt?: string;
  _softDeletedById?: number;
  _softDeletedByType?: string;
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
  oembed?: string;
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
  uuid?: unknown;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: BlogPost[];
  _softDeletedAt?: string;
  _softDeletedById?: number;
  _softDeletedByType?: string;
}

export interface BlogReaderState {
  id?: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  user: any;
  post: BlogPost | null;
  isFavorite?: boolean;
  firstReadAt?: string;
  lastReadAt?: string;
  favoritedAt?: string;
  isPinned?: boolean;
  pinnedAt?: string;
  readCount?: number;
  uuid?: unknown;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: BlogReaderState[];
  _softDeletedAt?: string;
  _softDeletedById?: number;
  _softDeletedByType?: string;
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
  uuid?: unknown;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: BlogTag[];
  _softDeletedAt?: string;
  _softDeletedById?: number;
  _softDeletedByType?: string;
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
  uuid?: unknown;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: Category[];
  _softDeletedAt?: string;
  _softDeletedById?: number;
  _softDeletedByType?: string;
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
  uuid?: unknown;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: ChantItem[];
  _softDeletedAt?: string;
  _softDeletedById?: number;
  _softDeletedByType?: string;
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
  uuid?: unknown;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: ChantPlan[];
  _softDeletedAt?: string;
  _softDeletedById?: number;
  _softDeletedByType?: string;
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
  uuid?: unknown;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: CommunityComment[];
  _softDeletedAt?: string;
  _softDeletedById?: number;
  _softDeletedByType?: string;
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
  uuid?: unknown;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: CommunityPost[];
  _softDeletedAt?: string;
  _softDeletedById?: number;
  _softDeletedByType?: string;
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
  uuid?: unknown;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: ContentHistory[];
  _softDeletedAt?: string;
  _softDeletedById?: number;
  _softDeletedByType?: string;
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
  uuid?: unknown;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: DownloadItem[];
  _softDeletedAt?: string;
  _softDeletedById?: number;
  _softDeletedByType?: string;
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
  oembed?: string;
  coverImage?: StrapiMediaRef | null;
  gallery?: StrapiMediaRef | null;
  files?: StrapiMediaRef | null;
  uuid?: unknown;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: Event[];
  _softDeletedAt?: string;
  _softDeletedById?: number;
  _softDeletedByType?: string;
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
  uuid?: unknown;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: GalleryItem[];
  _softDeletedAt?: string;
  _softDeletedById?: number;
  _softDeletedByType?: string;
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
  uuid?: unknown;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: GuestbookEntry[];
  _softDeletedAt?: string;
  _softDeletedById?: number;
  _softDeletedByType?: string;
}

export interface HeThongTest {
  id?: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  Ckeditor5: string;
  LucideIcon?: string;
  UUID?: unknown;
  uuid?: unknown;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: HeThongTest[];
  _softDeletedAt?: string;
  _softDeletedById?: number;
  _softDeletedByType?: string;
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
  menuIcon?: string;
  visualTheme?: unknown;
  blocks?: unknown;
  uuid?: unknown;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: HubPage[];
  _softDeletedAt?: string;
  _softDeletedById?: number;
  _softDeletedByType?: string;
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
  uuid?: unknown;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: LunarEvent[];
  _softDeletedAt?: string;
  _softDeletedById?: number;
  _softDeletedByType?: string;
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
  uuid?: unknown;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: LunarEventChantOverride[];
  _softDeletedAt?: string;
  _softDeletedById?: number;
  _softDeletedByType?: string;
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
  uuid?: unknown;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: PracticeLog[];
  _softDeletedAt?: string;
  _softDeletedById?: number;
  _softDeletedByType?: string;
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
  uuid?: unknown;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: PushJob[];
  _softDeletedAt?: string;
  _softDeletedById?: number;
  _softDeletedByType?: string;
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
  uuid?: unknown;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: PushSubscription[];
  _softDeletedAt?: string;
  _softDeletedById?: number;
  _softDeletedByType?: string;
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
  uuid?: unknown;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: RequestGuard[];
  _softDeletedAt?: string;
  _softDeletedById?: number;
  _softDeletedByType?: string;
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
  uuid?: unknown;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: Setting[];
  _softDeletedAt?: string;
  _softDeletedById?: number;
  _softDeletedByType?: string;
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
  uuid?: unknown;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: SidebarConfig[];
  _softDeletedAt?: string;
  _softDeletedById?: number;
  _softDeletedByType?: string;
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
  uuid?: unknown;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: Sutra[];
  _softDeletedAt?: string;
  _softDeletedById?: number;
  _softDeletedByType?: string;
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
  uuid?: unknown;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: SutraBookmark[];
  _softDeletedAt?: string;
  _softDeletedById?: number;
  _softDeletedByType?: string;
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
  uuid?: unknown;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: SutraChapter[];
  _softDeletedAt?: string;
  _softDeletedById?: number;
  _softDeletedByType?: string;
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
  uuid?: unknown;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: SutraGlossary[];
  _softDeletedAt?: string;
  _softDeletedById?: number;
  _softDeletedByType?: string;
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
  uuid?: unknown;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: SutraReadingProgress[];
  _softDeletedAt?: string;
  _softDeletedById?: number;
  _softDeletedByType?: string;
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
  uuid?: unknown;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: SutraVolume[];
  _softDeletedAt?: string;
  _softDeletedById?: number;
  _softDeletedByType?: string;
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
  uuid?: unknown;
  publishedAt?: string;
  createdBy?: any;
  updatedBy?: any;
  locale?: string;
  localizations?: UiIcon[];
  _softDeletedAt?: string;
  _softDeletedById?: number;
  _softDeletedByType?: string;
}
