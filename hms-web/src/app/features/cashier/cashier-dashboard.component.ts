import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { PaymentRequestService } from '../ip-admission/payment-request/payment-request.service';

interface DashboardCard {
  label: string;
  count: number | null;
  tone: string;
  route: string | null;
}

/** Cashier Module "Approvals/Refund" landing page (PDF screen 3): real-time count cards, only IP is wired up so far. */
@Component({
  selector: 'app-cashier-dashboard',
  standalone: true,
  imports: [PageHeaderComponent],
  templateUrl: './cashier-dashboard.component.html',
  styleUrl: './cashier-dashboard.component.scss'
})
export class CashierDashboardComponent {
  private readonly paymentRequestService = inject(PaymentRequestService);
  private readonly router = inject(Router);

  cards = signal<DashboardCard[]>([
    { label: 'Appointments', count: 0, tone: 'cd-tone-appointments', route: null },
    { label: 'Lab', count: 0, tone: 'cd-tone-lab', route: null },
    { label: 'Investigations', count: 0, tone: 'cd-tone-investigations', route: null },
    { label: 'IP', count: null, tone: 'cd-tone-ip', route: '/cashier/ip-approvals' },
    { label: 'Refunds', count: 0, tone: 'cd-tone-refunds', route: null }
  ]);

  constructor() {
    this.paymentRequestService.countPending().subscribe({
      next: ({ ip }) =>
        this.cards.update((cards) => cards.map((card) => (card.label === 'IP' ? { ...card, count: ip } : card)))
    });
  }

  open(card: DashboardCard): void {
    if (card.route) {
      this.router.navigate([card.route]);
    }
  }
}
