export type MedicalCategory = 'MEDICAL' | 'NON_MEDICAL';

export const MEDICAL_CATEGORIES: MedicalCategory[] = ['MEDICAL', 'NON_MEDICAL'];

export const MEDICAL_CATEGORY_LABELS: Record<MedicalCategory, string> = {
  MEDICAL: 'Medical',
  NON_MEDICAL: 'Non-Medical'
};

export interface Product {
  id: number | null;
  name: string;
  productTypeId: number;
  productTypeName: string | null;
  productCategory: string | null;
  drugDosage: string | null;
  drugType: string | null;
  rackId: number;
  rackName: string | null;
  manufacturerId: number | null;
  manufacturerName: string | null;
  medOrNonMed: MedicalCategory;
  centralGst: number;
  stateGst: number;
  hsnSac: string | null;
  active: boolean;
}
