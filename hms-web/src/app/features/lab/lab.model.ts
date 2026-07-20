export interface LabCategory {
  id: number;
  name: string;
  opAmount: number;
  ipAmount: number;
  orderingNo: number;
  subCategoryCount: number;
  componentCount: number;
}

export interface LabCategoryInput {
  name: string;
  opAmount: number;
  ipAmount: number;
  orderingNo: number;
}

export interface LabSubCategory {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  opAmount: number;
  ipAmount: number;
  notes: string | null;
  orderingNo: number;
  heading: string | null;
  componentCount: number;
}

export interface LabSubCategoryInput {
  categoryId: number;
  name: string;
  opAmount: number;
  ipAmount: number;
  notes: string | null;
  orderingNo: number;
  heading: string | null;
}

export interface LabComponent {
  id: number;
  subCategoryId: number;
  subCategoryName: string;
  categoryId: number;
  categoryName: string;
  name: string;
  fieldType: string | null;
  sampleType: string | null;
  method: string | null;
  maleRangeFrom: string | null;
  maleRangeTo: string | null;
  femaleRangeFrom: string | null;
  femaleRangeTo: string | null;
  normalRange: string | null;
  units: string | null;
  orderingNo: number;
  componentHeading: string | null;
  conventionalFactor: string | null;
  siUnit: string | null;
}

export interface LabComponentInput {
  subCategoryId: number;
  name: string;
  fieldType: string | null;
  sampleType: string | null;
  method: string | null;
  maleRangeFrom: string | null;
  maleRangeTo: string | null;
  femaleRangeFrom: string | null;
  femaleRangeTo: string | null;
  normalRange: string | null;
  units: string | null;
  orderingNo: number;
  componentHeading: string | null;
  conventionalFactor: string | null;
  siUnit: string | null;
}
