export interface CmsNewsEvent {
  id: number | null;
  title: string;
  body: string | null;
  eventDate: string | null;
  coverImagePath: string | null;
  publishedAt: string | null;
  active: boolean;
}

export type CmsNewsEventInput = Pick<CmsNewsEvent, 'title' | 'body' | 'eventDate'>;
