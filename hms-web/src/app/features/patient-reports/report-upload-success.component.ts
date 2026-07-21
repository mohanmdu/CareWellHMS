import { Component, inject, signal } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../shared/services/notification.service';
import { PatientReport } from './patient-report.model';
import { PatientReportService } from './patient-report.service';

/** Upload Reports (screen 4 of 4): confirmation after a successful upload. */
@Component({
  selector: 'app-report-upload-success',
  standalone: true,
  imports: [MatProgressBarModule],
  templateUrl: './report-upload-success.component.html',
  styleUrl: './report-upload-success.component.scss'
})
export class ReportUploadSuccessComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(PatientReportService);
  private readonly notification = inject(NotificationService);

  private readonly reportId = Number(this.route.snapshot.paramMap.get('id'));

  loading = signal(true);
  report = signal<PatientReport | null>(null);

  constructor() {
    this.service.get(this.reportId).subscribe({
      next: (report) => {
        this.report.set(report);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the upload confirmation.');
      }
    });
  }
}
