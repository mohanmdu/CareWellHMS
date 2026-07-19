import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';

/** Ward Change confirmation (PDF: "MESSAGE" banner): "The Patient {name} has been ward Changed from {old} to {new}." */
@Component({
  selector: 'app-ward-change-confirmation',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './ward-change-confirmation.component.html',
  styleUrl: './ward-change-confirmation.component.scss'
})
export class WardChangeConfirmationComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly patientName = signal(this.route.snapshot.queryParamMap.get('patientName') ?? 'the patient');
  readonly fromWard = signal(this.route.snapshot.queryParamMap.get('from') ?? '—');
  readonly toWard = signal(this.route.snapshot.queryParamMap.get('to') ?? '—');

  back(): void {
    this.router.navigate(['/ip/inpatient-list']);
  }
}
