export interface Drug {
  id: number | null;
  name: string;
  genericName: string | null;
  manufacturer: string | null;
  unitOfMeasure: string | null;
  active: boolean;
}
