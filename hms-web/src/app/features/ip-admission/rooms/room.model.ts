export interface Room {
  id: number | null;
  roomNumber: string;
  roomTypeId: number;
  roomTypeName: string | null;
  occupied: boolean;
}
