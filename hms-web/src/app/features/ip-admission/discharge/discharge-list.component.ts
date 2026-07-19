import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { Admission } from '../admissions/admission.model';
import { AdmissionService } from '../admissions/admission.service';

/** Discharge List (PDF): read-only archive of fully DISCHARGED admissions - the terminal stop of the discharge lifecycle. */
@Component({
  selector: 'app-discharge-list',
  standalone: true,
  imports: [DatePipe, DecimalPipe, MatButtonModule, MatTableModule, MatProgressBarModule, PageHeaderComponent, EmptyStateComponent],
  templateUrl: './discharge-list.component.html',
  styleUrl: './discharge-list.component.scss'
})
export class DischargeListComponent {
  private readonly admissionService = inject(AdmissionService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  readonly displayedColumns = ['dischargeNumber', 'admissionNumber', 'patient', 'room', 'dischargeDate', 'dischargeType', 'settlement', 'actions'];

  loading = signal(true);
  admissions = signal<Admission[]>([]);

  discharged = computed(() => this.admissions().filter((a) => a.status === 'DISCHARGED'));

  constructor() {
    this.admissionService.list().subscribe({
      next: (admissions) => {
        this.admissions.set(admissions);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load discharged admissions.');
      }
    });
  }

  viewBilling(admission: Admission): void {
    if (admission.id === null) {
      return;
    }
    this.router.navigate(['/ip/admissions', admission.id, 'billing']);
  }
}
