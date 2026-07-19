export interface CmsFaq {
  id: number | null;
  question: string;
  answer: string;
  sortOrder: number | null;
  active: boolean;
}

export type CmsFaqInput = Pick<CmsFaq, 'question' | 'answer' | 'sortOrder'>;
