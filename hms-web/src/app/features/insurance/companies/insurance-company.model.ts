export interface InsuranceCompany {
  id: number | null;
  insuranceType: string;
  companyName: string;
  active: boolean;
  createdAt: string | null;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  deactivatedAt: string | null;
  deactivatedBy: string | null;
}

export type InsuranceCompanyInput = Pick<InsuranceCompany, 'insuranceType' | 'companyName'>;

export const INSURANCE_COMPANY_TYPE_OPTIONS = ['Direct Insurance', 'Private TPA', 'Govt Insurance', 'Corporate Name', 'TPA Name'];
