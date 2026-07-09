import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Appointment } from './appointment.model';

export type AppointmentBookingInput = Pick<
  Appointment,
  'patientId' | 'consultantId' | 'appointmentDate' | 'slotTime' | 'notes'
>;

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/registration/appointments`;

  list(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.baseUrl);
  }

  book(appointment: AppointmentBookingInput): Observable<Appointment> {
    return this.http.post<Appointment>(this.baseUrl, appointment);
  }

  confirm(id: number): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.baseUrl}/${id}/confirm`, {});
  }

  cancel(id: number, reason: string): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.baseUrl}/${id}/cancel`, { reason });
  }
}
