export interface Department {
  id: number | null;
  name: string;
  active: boolean;
  publishedToWeb: boolean;
  createdAt: string | null;
  createdBy: string | null;
  deactivatedAt: string | null;
  deactivatedBy: string | null;
  consultantCount: number;
}
