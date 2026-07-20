import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

/** Requisition Submitted (screen 3 of 6): confirmation + hand-off to Lab Billing. */
@Component({
  selector: 'app-lab-requisition-success',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './lab-requisition-success.component.html',
  styleUrl: './lab-requisition-success.component.scss'
})
export class LabRequisitionSuccessComponent {
  private readonly router = inject(Router);

  goToLabBilling(): void {
    this.router.navigate(['/lab/billing']);
  }
}
