import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentRequestType, requestTypeLabel } from './payment-request.model';

/** Success banner (Cashier Approval Workflow, PDF screen 2): "[Request Type] Request has been sent to cashier." */
@Component({
  selector: 'app-payment-request-success',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './payment-request-success.component.html',
  styleUrl: './payment-request-success.component.scss'
})
export class PaymentRequestSuccessComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly admissionId = Number(this.route.snapshot.paramMap.get('id'));
  readonly requestTypeLabel = signal(
    requestTypeLabel((this.route.snapshot.queryParamMap.get('type') as PaymentRequestType) ?? 'ADVANCE')
  );

  back(): void {
    this.router.navigate(['/ip/admissions', this.admissionId, 'billing']);
  }
}
