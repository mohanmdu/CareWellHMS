import { DayOfWeek, Session } from '../../masters-admin/consultants/consultant-timing.model';

export type AppointmentStatus = 'BOOKED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type CancelledBy = 'HOSPITAL' | 'PATIENT';
export type PaymentMode = 'CASH' | 'CARD' | 'UPI' | 'NET_BANKING' | 'INSURANCE' | 'OTHER';

export const PAYMENT_MODES: PaymentMode[] = ['CASH', 'CARD', 'UPI', 'NET_BANKING', 'INSURANCE', 'OTHER'];

export const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  CASH: 'Cash',
  CARD: 'Card',
  UPI: 'UPI',
  NET_BANKING: 'Net Banking',
  INSURANCE: 'Insurance',
  OTHER: 'Other'
};

export interface Appointment {
  id: number | null;
  patientId: number;
  patientRegistrationNumber: string | null;
  patientName: string | null;
  patientAge: number | null;
  patientGender: string | null;
  consultantId: number;
  consultantName: string | null;
  departmentName: string | null;
  appointmentDate: string;
  slotTime: string;
  status: AppointmentStatus;
  notes: string | null;
  cancellationReason: string | null;
  cancelledBy: CancelledBy | null;
  invoicedAmount: number | null;
  paidAmount: number | null;
  discountAmount: number | null;
  doctorReferralAmount: number | null;
  paymentMode: PaymentMode | null;
  billingRemarks: string | null;
  billedAt: string | null;
  invoiceNumber: number | null;
  billedBy: string | null;
  refundAmount: number | null;
}

export type CollectionReportSource = 'APPOINTMENT' | 'DIRECT_BILLING';

export interface CollectionReportEntry {
  source: CollectionReportSource;
  appointmentId: number | null;
  directBillingId: number | null;
  invoiceNumber: number | null;
  patientName: string | null;
  patientRegistrationNumber: string | null;
  billedAt: string | null;
  paymentMode: PaymentMode | null;
  consultantName: string | null;
  billedBy: string | null;
  invoicedAmount: number | null;
  doctorReferralAmount: number | null;
  paidAmount: number | null;
  refundAmount: number | null;
}

export interface AppointmentAuditLogEntry {
  id: number;
  operation: string;
  patientName: string | null;
  consultantName: string | null;
  departmentName: string | null;
  appointmentDate: string | null;
  slotTime: string | null;
  channel: string;
  previousValue: string | null;
  newValue: string | null;
  performedBy: string | null;
  performedAt: string;
}

export type SlotStatus = 'AVAILABLE' | 'PAST' | 'BOOKED';

export interface AppointmentSlot {
  /** The slot's true calendar date - for a NIGHT session queried against day D, the post-midnight portion carries D+1, not D. */
  date: string;
  time: string;
  session: Session;
  status: SlotStatus;
  appointmentId: number | null;
  patientId: number | null;
  patientName: string | null;
}

export interface SessionSummary {
  session: Session;
  open: boolean;
  availableCount: number;
  bookedCount: number;
}

export interface DailyAvailability {
  date: string;
  dayOfWeek: DayOfWeek;
  sessions: SessionSummary[];
}
