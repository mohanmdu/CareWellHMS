export interface CmsBannerSlide {
  id: number | null;
  title: string;
  subtitle: string | null;
  imagePath: string | null;
  linkUrl: string | null;
  sortOrder: number | null;
  active: boolean;
}

export type CmsBannerSlideInput = Pick<CmsBannerSlide, 'title' | 'subtitle' | 'linkUrl' | 'sortOrder'>;
