export interface CmsBlogPost {
  id: number | null;
  title: string;
  slug: string;
  body: string | null;
  coverImagePath: string | null;
  publishedAt: string | null;
  active: boolean;
}

export type CmsBlogPostInput = Pick<CmsBlogPost, 'title' | 'slug' | 'body'>;
