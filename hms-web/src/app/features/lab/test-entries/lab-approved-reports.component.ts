import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { ClinicSettingsService } from '../../masters-admin/clinic-settings/clinic-settings.service';
import { LabApprovedListRow } from './lab-test-entry.model';
import { LabTestEntryService } from './lab-test-entry.service';

/**
 * Approved Lab Reports / Reports Share to WhatsApp: the finalized report
 * ledger. "Share to WhatsApp" opens a wa.me chat with the patient's mobile
 * number and a pre-filled notification message - this app has no WhatsApp
 * Business API/credentials, so it's a real client-side deep link (the
 * standard no-API way to start a WhatsApp chat), not an automated send.
 */
@Component({
  selector: 'app-lab-approved-reports',
  standalone: true,
  imports: [DatePipe, FormsModule, MatButtonModule, MatDatepickerModule, MatFormFieldModule, MatIconModule, MatInputModule, MatProgressBarModule, EmptyStateComponent],
  templateUrl: './lab-approved-reports.component.html',
  styleUrl: './lab-approved-reports.component.scss'
})
export class LabApprovedReportsComponent {
  private readonly service = inject(LabTestEntryService);
  private readonly clinicSettingsService = inject(ClinicSettingsService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  loading = signal(false);
  rows = signal<LabApprovedListRow[]>([]);
  private clinicName = 'the hospital';

  constructor() {
    this.search();
    this.clinicSettingsService.get().subscribe({
      next: (settings) => {
        if (settings.name) {
          this.clinicName = settings.name;
        }
      },
      error: () => {}
    });
  }

  search(): void {
    this.loading.set(true);
    this.service.getApproved().subscribe({
      next: (rows) => {
        this.rows.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load approved lab reports.');
      }
    });
  }

  view(row: LabApprovedListRow): void {
    this.router.navigate(['/lab/test-entries', row.id, 'print']);
  }

  shareToWhatsApp(row: LabApprovedListRow): void {
    const digitsOnly = row.mobileNumber.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Hello ${row.patientName}, your lab report is ready. Please contact ${this.clinicName} for details.`
    );
    window.open(`https://wa.me/${digitsOnly}?text=${message}`, '_blank');
  }
}
