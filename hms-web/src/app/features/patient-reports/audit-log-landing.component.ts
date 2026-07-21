import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

/** Audit Log for Medical Reports (screen 1 of 3): pick which audit log to view. */
@Component({
  selector: 'app-audit-log-landing',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './audit-log-landing.component.html',
  styleUrl: './audit-log-landing.component.scss'
})
export class AuditLogLandingComponent {
  private readonly router = inject(Router);

  goToPatientLog(): void {
    this.router.navigate(['/patient-reports/audit-log/patient']);
  }

  goToDoctorLog(): void {
    this.router.navigate(['/patient-reports/audit-log/doctor']);
  }
}
