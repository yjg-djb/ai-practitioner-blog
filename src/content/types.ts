export type ContentLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type QuickPrompt = {
  id: string;
  label: string;
  prompt: string;
};

export type ProofPoint = {
  value: string;
  label: string;
  detail: string;
};

export type WorkflowStep = {
  title: string;
  detail: string;
};

export type SkillGroup = {
  title: string;
  items: string[];
};

export type SeoMeta = {
  title: string;
  description: string;
  path: string;
  type: 'website' | 'article';
  image: string;
  publishedTime?: string;
  modifiedTime?: string;
};

export type TimelineEntry = {
  kind: 'work' | 'education';
  period: string;
  title: string;
  organization: string;
  summary: string;
  highlights: string[];
};

export type ProjectEntry = {
  slug: string;
  title: string;
  kicker: string;
  organization: string;
  timeframe: string;
  role: string;
  teaser: string;
  summary: string;
  impact: string[];
  metrics: ProofPoint[];
  stack: string[];
  workflow: WorkflowStep[];
  responsibilities: string[];
  architecture: string[];
  tradeoffs: string[];
  outcomes: string[];
  relatedNoteSlugs: string[];
  links: ContentLink[];
  seo: SeoMeta;
};

export type NoteSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type NoteEntry = {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  readTime: string;
  tags: string[];
  takeaways: string[];
  sections: NoteSection[];
  relatedProjectSlugs: string[];
  seo: SeoMeta;
};

export type Profile = {
  name: string;
  englishName: string;
  role: string;
  heroBadge: string;
  heroTitle: string;
  heroSummary: string;
  availability: string;
  location: string;
  email: string;
  phone: string;
  github: string;
  resumeUrl: string;
  targetRoles: string[];
  proofPoints: ProofPoint[];
  recruiterNotes: string[];
  summary: string[];
  featuredEmployers: string[];
  awardHighlights: string[];
  skillGroups: SkillGroup[];
  quickPrompts: QuickPrompt[];
  contactLinks: ContentLink[];
  timeline: TimelineEntry[];
  seo: SeoMeta;
};

export type RouteInfo =
  | { kind: 'home'; pathname: '/'; seo: SeoMeta; profile: Profile }
  | { kind: 'project'; pathname: string; seo: SeoMeta; project: ProjectEntry }
  | { kind: 'note'; pathname: string; seo: SeoMeta; note: NoteEntry }
  | { kind: 'notFound'; pathname: string; seo: SeoMeta };

export type SitemapEntry = {
  path: string;
  lastModified: string;
};
