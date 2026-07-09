import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { PatientFormDialogComponent } from './patient-form-dialog.component';
import { Patient } from './patient.model';
import { PatientService } from './patient.service';

/**
 * Patient Registration: one screen, two tabs (Active / Inactive). Add and
 * Edit both use the same dialog (PatientFormDialogComponent); delete is
 * soft (moves a patient to the Inactive tab) with a separate, destructive
 * permanent-delete action available only from there.
 */
@Component({
  selector: 'app-patient-registration',
  standalone: true,
  imports: [
    MatTabsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    PageHeaderComponent,
    EmptyStateComponent
  ],
  templateUrl: './patient-registration.component.html',
  styleUrl: './patient-registration.component.scss'
})
export class PatientRegistrationComponent {
  private readonly service = inject(PatientService);
  private readonly notification = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly dialog = inject(MatDialog);

  readonly activeColumns = ['registrationNumber', 'name', 'gender', 'age', 'mobileNumber', 'address', 'actions'];
  readonly inactiveColumns = ['registrationNumber', 'name', 'gender', 'age', 'mobileNumber', 'address', 'actions'];

  activePatients = signal<Patient[]>([]);
  inactivePatients = signal<Patient[]>([]);
  loadingActive = signal(false);
  loadingInactive = signal(false);

  constructor() {
    this.refreshActive();
  }

  refreshActive(): void {
    this.loadingActive.set(true);
    this.service.search('').subscribe({
      next: (patients) => {
        this.activePatients.set(patients);
        this.loadingActive.set(false);
      },
      error: () => {
        this.loadingActive.set(false);
        this.notification.error('Failed to load patients.');
      }
    });
  }

  refreshInactive(): void {
    this.loadingInactive.set(true);
    this.service.listInactive().subscribe({
      next: (patients) => {
        this.inactivePatients.set(patients);
        this.loadingInactive.set(false);
      },
      error: () => {
        this.loadingInactive.set(false);
        this.notification.error('Failed to load inactive patients.');
      }
    });
  }

  onTabChange(index: number): void {
    if (index === 1) {
      this.refreshInactive();
    }
  }

  openAddDialog(): void {
    this.dialog
      .open(PatientFormDialogComponent, { width: '480px', data: {} })
      .afterClosed()
      .subscribe((result) => {
        if (!result) {
          return;
        }
        this.service.register(result).subscribe({
          next: () => {
            this.notification.success('Patient registered.');
            this.refreshActive();
          },
          error: (err) => this.notification.error(err.error?.message ?? 'Failed to register patient.')
        });
      });
  }

  openEditDialog(patient: Patient): void {
    if (patient.id === null) {
      return;
    }
    this.dialog
      .open(PatientFormDialogComponent, { width: '480px', data: { patient } })
      .afterClosed()
      .subscribe((result) => {
        if (!result || patient.id === null) {
          return;
        }
        this.service.update(patient.id, result).subscribe({
          next: () => {
            this.notification.success('Patient updated.');
            this.refreshActive();
          },
          error: (err) => this.notification.error(err.error?.message ?? 'Failed to update patient.')
        });
      });
  }

  deletePatient(patient: Patient): void {
    if (patient.id === null) {
      return;
    }
    this.confirmDialog
      .confirm({
        title: `Delete ${patient.firstName}?`,
        message: 'The patient will be moved to Inactive Patients and can be restored later.',
        confirmLabel: 'Delete',
        destructive: true
      })
      .subscribe((confirmed) => {
        if (!confirmed || patient.id === null) {
          return;
        }
        this.service.softDelete(patient.id).subscribe({
          next: () => {
            this.notification.success('Patient deleted.');
            this.refreshActive();
          },
          error: () => this.notification.error('Failed to delete patient.')
        });
      });
  }

  restorePatient(patient: Patient): void {
    if (patient.id === null) {
      return;
    }
    this.service.restore(patient.id).subscribe({
      next: () => {
        this.notification.success('Patient restored.');
        this.refreshInactive();
      },
      error: () => this.notification.error('Failed to restore patient.')
    });
  }

  permanentlyDeletePatient(patient: Patient): void {
    if (patient.id === null) {
      return;
    }
    this.confirmDialog
      .confirm({
        title: `Permanently delete ${patient.firstName}?`,
        message: 'This cannot be undone - all record of this patient will be removed.',
        confirmLabel: 'Delete permanently',
        destructive: true
      })
      .subscribe((confirmed) => {
        if (!confirmed || patient.id === null) {
          return;
        }
        this.service.permanentDelete(patient.id).subscribe({
          next: () => {
            this.notification.success('Patient permanently deleted.');
            this.refreshInactive();
          },
          error: () => this.notification.error('Failed to permanently delete patient.')
        });
      });
  }
}
