import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { NotificationService } from '../../../shared/services/notification.service';
import { PromptDialogService } from '../../../shared/services/prompt-dialog.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { PatientSearchComponent } from '../../../shared/ui/patient-search/patient-search.component';
import { StatusBadgeComponent, StatusBadgeTone } from '../../../shared/ui/status-badge/status-badge.component';
import { Patient } from '../../registration/patients/patient.model';
import { Room } from '../rooms/room.model';
import { RoomService } from '../rooms/room.service';
import { Admission } from './admission.model';
import { AdmissionService } from './admission.service';

const STATUS_TONE: Record<string, StatusBadgeTone> = {
  ADMITTED: 'info',
  DISCHARGED: 'success'
};

/**
 * Replaces PatientIPRegistration.jsp (admission) + IPBillingCategory/Component
 * screens (advance/discharge) - migration doc §4.2. Ward charges during the
 * stay are billed through the existing generic Invoice screens
 * (Billing > New Invoice), not duplicated here.
 */
@Component({
  selector: 'app-admission-worklist',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    PageHeaderComponent,
    PatientSearchComponent,
    StatusBadgeComponent,
    EmptyStateComponent
  ],
  templateUrl: './admission-worklist.component.html',
  styleUrl: './admission-worklist.component.scss'
})
export class AdmissionWorklistComponent {
  private readonly roomService = inject(RoomService);
  private readonly admissionService = inject(AdmissionService);
  private readonly notification = inject(NotificationService);
  private readonly promptDialog = inject(PromptDialogService);

  readonly displayedColumns = [
    'admissionNumber',
    'patient',
    'room',
    'status',
    'advance',
    'totalBilled',
    'settlement',
    'actions'
  ];
  readonly statusTone = STATUS_TONE;

  loading = signal(false);
  admissions = signal<Admission[]>([]);
  availableRooms = signal<Room[]>([]);

  selectedPatient = signal<Patient | null>(null);
  selectedRoomId: number | null = null;
  admitting = signal(false);

  constructor() {
    this.refresh();
    this.refreshAvailableRooms();
  }

  refresh(): void {
    this.loading.set(true);
    this.admissionService.list().subscribe({
      next: (admissions) => {
        this.admissions.set(admissions);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load admissions.');
      }
    });
  }

  refreshAvailableRooms(): void {
    this.roomService.list().subscribe({ next: (rooms) => this.availableRooms.set(rooms.filter((r) => !r.occupied)) });
  }

  selectPatient(patient: Patient): void {
    this.selectedPatient.set(patient);
  }

  changePatient(): void {
    this.selectedPatient.set(null);
    this.selectedRoomId = null;
  }

  admit(): void {
    const patient = this.selectedPatient();
    if (!patient || patient.id === null || !this.selectedRoomId) {
      return;
    }
    this.admitting.set(true);
    this.admissionService.admit(patient.id, this.selectedRoomId).subscribe({
      next: () => {
        this.admitting.set(false);
        this.selectedPatient.set(null);
        this.selectedRoomId = null;
        this.notification.success('Patient admitted.');
        this.refresh();
        this.refreshAvailableRooms();
      },
      error: (err) => {
        this.admitting.set(false);
        this.notification.error(err.error?.message ?? 'Failed to admit patient.');
      }
    });
  }

  addAdvance(admission: Admission): void {
    if (admission.id === null) {
      return;
    }
    this.promptDialog
      .prompt({
        title: `Add advance payment - ${admission.admissionNumber}`,
        fields: [{ key: 'amount', label: 'Advance amount', type: 'number', required: true, min: 0 }]
      })
      .subscribe((values) => {
        if (!values || admission.id === null) {
          return;
        }
        const amount = values['amount'] as number;
        if (!amount || amount <= 0) {
          return;
        }
        this.admissionService.addAdvancePayment(admission.id, amount).subscribe({
          next: () => {
            this.notification.success('Advance payment recorded.');
            this.refresh();
          },
          error: (err) => this.notification.error(err.error?.message ?? 'Failed to record advance payment.')
        });
      });
  }

  discharge(admission: Admission): void {
    if (admission.id === null) {
      return;
    }
    this.promptDialog
      .prompt({
        title: `Discharge - ${admission.admissionNumber}`,
        fields: [
          { key: 'totalBilled', label: 'Total billed amount for this stay', type: 'number', required: true, min: 0 },
          { key: 'dischargeSummary', label: 'Discharge summary', type: 'textarea' }
        ],
        confirmLabel: 'Discharge'
      })
      .subscribe((values) => {
        if (!values || admission.id === null) {
          return;
        }
        this.admissionService
          .discharge(admission.id, values['totalBilled'] as number, values['dischargeSummary'] as string)
          .subscribe({
            next: () => {
              this.notification.success('Patient discharged.');
              this.refresh();
              this.refreshAvailableRooms();
            },
            error: (err) => this.notification.error(err.error?.message ?? 'Failed to discharge patient.')
          });
      });
  }
}
