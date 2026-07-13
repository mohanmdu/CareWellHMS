import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Appointment,
  AppointmentAuditLogEntry,
  AppointmentSlot,
  AppointmentStatus,
  CancelledBy,
  CollectionReportEntry,
  DailyAvailability,
  PaymentMode
} from './appointment.model';

export type AppointmentBookingInput = Pick<
  Appointment,
  'patientId' | 'consultantId' | 'appointmentDate' | 'slotTime' | 'notes'
>;

export interface AppointmentListFilter {
  status?: AppointmentStatus;
  fromDate?: string;
  toDate?: string;
  departmentId?: number;
  patientId?: number;
}

export interface CollectionReportFilter {
  fromDate?: string;
  toDate?: string;
  consultantId?: number;
  paymentMode?: PaymentMode;
}

export interface BillAppointmentInput {
  paidAmount: number;
  discountAmount: number;
  doctorReferralAmount: number;
  paymentMode: PaymentMode;
  remarks: string | null;
}

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/registration/appointments`;

  get(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.baseUrl}/${id}`);
  }

  list(filter?: AppointmentListFilter): Observable<Appointment[]> {
    const params: Record<string, string> = {};
    if (filter?.status) {
      params['status'] = filter.status;
    }
    if (filter?.fromDate) {
      params['fromDate'] = filter.fromDate;
    }
    if (filter?.toDate) {
      params['toDate'] = filter.toDate;
    }
    if (filter?.departmentId) {
      params['departmentId'] = String(filter.departmentId);
    }
    if (filter?.patientId) {
      params['patientId'] = String(filter.patientId);
    }
    return this.http.get<Appointment[]>(this.baseUrl, { params });
  }

  getAvailabilitySummary(consultantId: number, fromDate: string, toDate: string): Observable<DailyAvailability[]> {
    return this.http.get<DailyAvailability[]>(`${this.baseUrl}/availability-summary`, {
      params: { consultantId: String(consultantId), fromDate, toDate }
    });
  }

  getSlots(consultantId: number, date: string): Observable<AppointmentSlot[]> {
    return this.http.get<AppointmentSlot[]>(`${this.baseUrl}/slots`, {
      params: { consultantId: String(consultantId), date }
    });
  }

  book(appointment: AppointmentBookingInput): Observable<Appointment> {
    return this.http.post<Appointment>(this.baseUrl, appointment);
  }

  confirm(id: number): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.baseUrl}/${id}/confirm`, {});
  }

  cancel(id: number, reason: string, cancelledBy: CancelledBy): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.baseUrl}/${id}/cancel`, { reason, cancelledBy });
  }

  bill(id: number, input: BillAppointmentInput): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.baseUrl}/${id}/bill`, input);
  }

  /** Preview of the Invoice No the next bill() call will assign - see AppointmentService.peekNextInvoiceNumber(). */
  getNextInvoiceNumber(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/next-invoice-number`);
  }

  getCollectionReport(filter?: CollectionReportFilter): Observable<CollectionReportEntry[]> {
    const params: Record<string, string> = {};
    if (filter?.fromDate) {
      params['fromDate'] = filter.fromDate;
    }
    if (filter?.toDate) {
      params['toDate'] = filter.toDate;
    }
    if (filter?.consultantId) {
      params['consultantId'] = String(filter.consultantId);
    }
    if (filter?.paymentMode) {
      params['paymentMode'] = filter.paymentMode;
    }
    return this.http.get<CollectionReportEntry[]>(`${this.baseUrl}/collection-report`, { params });
  }

  getAuditLogs(): Observable<AppointmentAuditLogEntry[]> {
    return this.http.get<AppointmentAuditLogEntry[]>(`${this.baseUrl}/audit-logs`);
  }
}
