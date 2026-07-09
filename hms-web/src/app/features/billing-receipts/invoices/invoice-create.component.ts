import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { PatientSearchComponent } from '../../../shared/ui/patient-search/patient-search.component';
import { Appointment } from '../../appointments/booking/appointment.model';
import { AppointmentService } from '../../appointments/booking/appointment.service';
import { Patient } from '../../registration/patients/patient.model';
import { BillingItem } from '../items/billing-item.model';
import { BillingItemService } from '../items/billing-item.service';
import { InvoiceService } from './invoice.service';

interface DraftLine {
  billingItemId: number;
  itemName: string;
  unitPrice: number;
  quantity: number;
}

/**
 * Replaces the legacy OPBillingCategory.jsp / OPcomponentsAjax.jsp cashier
 * flow (migration doc §4.1) - one screen: pick patient (+ optional linked
 * appointment), add priced catalog items, submit as one invoice payload
 * instead of the legacy's per-line-item Struts round trips.
 */
@Component({
  selector: 'app-invoice-create',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    PageHeaderComponent,
    EmptyStateComponent,
    PatientSearchComponent
  ],
  templateUrl: './invoice-create.component.html',
  styleUrl: './invoice-create.component.scss'
})
export class InvoiceCreateComponent {
  private readonly appointmentService = inject(AppointmentService);
  private readonly billingItemService = inject(BillingItemService);
  private readonly invoiceService = inject(InvoiceService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  readonly lineColumns = ['item', 'quantity', 'unitPrice', 'lineTotal', 'actions'];

  submitting = signal(false);

  selectedPatient = signal<Patient | null>(null);

  allAppointments = signal<Appointment[]>([]);
  selectedAppointmentId: number | null = null;
  readonly patientAppointments = computed(() =>
    this.allAppointments().filter((a) => a.patientId === this.selectedPatient()?.id)
  );

  billingItems = signal<BillingItem[]>([]);
  selectedBillingItemId: number | null = null;
  quantity = 1;
  draftLines = signal<DraftLine[]>([]);

  readonly total = computed(() => this.draftLines().reduce((sum, line) => sum + line.unitPrice * line.quantity, 0));

  constructor() {
    this.billingItemService.list().subscribe({
      next: (items) => this.billingItems.set(items.filter((i) => i.active)),
      error: () => this.notification.error('Failed to load billing items.')
    });
    this.appointmentService.list().subscribe({ next: (appointments) => this.allAppointments.set(appointments) });
  }

  selectPatient(patient: Patient): void {
    this.selectedPatient.set(patient);
    this.selectedAppointmentId = null;
  }

  changePatient(): void {
    this.selectedPatient.set(null);
    this.draftLines.set([]);
  }

  addLine(): void {
    const item = this.billingItems().find((i) => i.id === this.selectedBillingItemId);
    if (!item || this.quantity < 1) {
      return;
    }
    this.draftLines.update((lines) => [
      ...lines,
      { billingItemId: item.id!, itemName: item.name, unitPrice: item.price, quantity: this.quantity }
    ]);
    this.selectedBillingItemId = null;
    this.quantity = 1;
  }

  removeLine(index: number): void {
    this.draftLines.update((lines) => lines.filter((_, i) => i !== index));
  }

  submit(): void {
    const patient = this.selectedPatient();
    if (!patient || patient.id === null || this.draftLines().length === 0) {
      return;
    }
    this.submitting.set(true);
    this.invoiceService
      .create({
        patientId: patient.id,
        appointmentId: this.selectedAppointmentId,
        lineItems: this.draftLines().map((l) => ({ billingItemId: l.billingItemId, quantity: l.quantity }))
      })
      .subscribe({
        next: () => {
          this.notification.success('Invoice created.');
          this.router.navigateByUrl('/billing/invoices');
        },
        error: (err) => {
          this.submitting.set(false);
          this.notification.error(err.error?.message ?? 'Failed to create invoice.');
        }
      });
  }
}
