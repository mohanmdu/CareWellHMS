export interface RoomType {
  id: number | null;
  name: string;
  rentCash: number;
  rentClaim: number;
  active: boolean;
  roomCount: number;
  createdAt: string | null;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  deactivatedAt: string | null;
  deactivatedBy: string | null;
}

export type RoomTypeInput = Pick<RoomType, 'name' | 'rentCash' | 'rentClaim'>;
