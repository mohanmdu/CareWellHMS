export type AppointmentStatus = 'BOOKED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Appointment {
  id: number | null;
  patientId: number;
  patientName: string | null;
  consultantId: number;
  consultantName: string | null;
  departmentName: string | null;
  appointmentDate: string;
  slotTime: string;
  status: AppointmentStatus;
  notes: string | null;
  cancellationReason: string | null;
}
