import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

/** Upload Reports (screen 1 of 4): a single entry point into the Reports Upload form. */
@Component({
  selector: 'app-report-upload-landing',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './report-upload-landing.component.html',
  styleUrl: './report-upload-landing.component.scss'
})
export class ReportUploadLandingComponent {
  private readonly router = inject(Router);

  goToPatientUpload(): void {
    this.router.navigate(['/patient-reports/upload/patient']);
  }
}
