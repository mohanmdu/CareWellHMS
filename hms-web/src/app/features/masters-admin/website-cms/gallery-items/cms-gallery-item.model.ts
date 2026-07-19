export type CmsGalleryItemType = 'PHOTO' | 'VIDEO';

export interface CmsGalleryItem {
  id: number | null;
  type: CmsGalleryItemType;
  title: string | null;
  mediaPathOrUrl: string | null;
  album: string | null;
  active: boolean;
}

export type CmsGalleryItemInput = Pick<CmsGalleryItem, 'type' | 'title' | 'mediaPathOrUrl' | 'album'>;
