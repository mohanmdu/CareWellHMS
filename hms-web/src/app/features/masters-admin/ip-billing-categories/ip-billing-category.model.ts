import { RevenueBucket } from '../../../shared/revenue-bucket.model';

export interface IpBillingCategory {
  id: number | null;
  name: string;
  active: boolean;
  revenueBucket: RevenueBucket;
}
