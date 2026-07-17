export type RoomStatus = 'AVAILABLE' | 'ALLOCATED' | 'MAINTENANCE';

export interface Room {
  id: number | null;
  roomNumber: string;
  roomTypeId: number;
  roomTypeName: string | null;
  rentCash: number | null;
  status: RoomStatus;
  active: boolean;
  createdAt: string | null;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  deactivatedAt: string | null;
  deactivatedBy: string | null;
}

export type RoomInput = Pick<Room, 'roomNumber' | 'roomTypeId'>;
