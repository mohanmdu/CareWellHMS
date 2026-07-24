import { RevenueBucket } from '../../../shared/revenue-bucket.model';

export interface OpBillingCategory {
  id: number | null;
  name: string;
  active: boolean;
  revenueBucket: RevenueBucket;
}
