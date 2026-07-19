export interface CmsHealthPackage {
  id: number | null;
  name: string;
  description: string | null;
  price: number;
  includes: string | null;
  active: boolean;
}

export type CmsHealthPackageInput = Pick<CmsHealthPackage, 'name' | 'description' | 'price' | 'includes'>;
