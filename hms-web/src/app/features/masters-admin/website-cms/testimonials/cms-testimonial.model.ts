export interface CmsTestimonial {
  id: number | null;
  patientName: string;
  quote: string;
  rating: number | null;
  photoPath: string | null;
  active: boolean;
}

export type CmsTestimonialInput = Pick<CmsTestimonial, 'patientName' | 'quote' | 'rating'>;
