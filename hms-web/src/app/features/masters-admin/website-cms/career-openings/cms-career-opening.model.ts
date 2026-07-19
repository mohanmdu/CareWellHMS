export interface CmsCareerOpening {
  id: number | null;
  title: string;
  departmentId: number | null;
  departmentName: string | null;
  description: string | null;
  applyEmail: string | null;
  active: boolean;
}

export type CmsCareerOpeningInput = Pick<CmsCareerOpening, 'title' | 'departmentId' | 'description' | 'applyEmail'>;
