import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PharmacyReturnInvoice } from '../../../features/pharmacy/pharmacy-returns/pharmacy-return.model';
import { PharmacyReturnWorkflowService } from '../../../features/pharmacy/pharmacy-returns/pharmacy-return.service';
import { NotificationService } from '../../services/notification.service';
import { EmptyStateComponent } from '../empty-state/empty-state.component';

/**
 * Search-by-Invoice-Number picker for Sales Return, same self-contained
 * mount-while-searching/unmount-on-found shape as app-patient-search: the
 * parent mounts this only while no invoice is yet selected and removes it
 * once one is found, resetting state for free.
 */
@Component({
  selector: 'app-invoice-search',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressBarModule, EmptyStateComponent],
  templateUrl: './invoice-search.component.html',
  styleUrl: './invoice-search.component.scss'
})
export class InvoiceSearchComponent {
  private readonly service = inject(PharmacyReturnWorkflowService);
  private readonly notification = inject(NotificationService);

  readonly invoiceFound = output<PharmacyReturnInvoice>();

  billNumberInput: number | null = null;
  searching = signal(false);
  notFound = signal(false);

  search(): void {
    if (!this.billNumberInput) {
      return;
    }
    this.searching.set(true);
    this.notFound.set(false);
    this.service.searchInvoice(this.billNumberInput).subscribe({
      next: (invoice) => {
        this.searching.set(false);
        this.invoiceFound.emit(invoice);
      },
      error: (err) => {
        this.searching.set(false);
        this.notFound.set(true);
        this.notification.error(err.error?.message ?? 'No invoice found for that Invoice Number.');
      }
    });
  }
}
