import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { INSURANCE_COMPANY_TYPE_OPTIONS, InsuranceCompany, InsuranceCompanyInput } from './insurance-company.model';
import { InsuranceCompanyService } from './insurance-company.service';

const EMPTY_FORM: InsuranceCompanyInput = { insuranceType: '', companyName: '' };

/**
 * Insurance Company Master: inline Add/Update/Clear form plus separate
 * Active/Deactivated tables below - the source list for the "Insurance
 * Company"/"Select Company" fields used elsewhere in the Insurance module
 * (those still use a fixed static list today; wiring them to this live
 * master is a separate follow-up, not done as part of adding this screen).
 */
@Component({
  selector: 'app-insurance-company-list',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    PageHeaderComponent,
    EmptyStateComponent
  ],
  templateUrl: './insurance-company-list.component.html',
  styleUrl: './insurance-company-list.component.scss'
})
export class InsuranceCompanyListComponent {
  private readonly service = inject(InsuranceCompanyService);
  private readonly notification = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly insuranceTypeOptions = INSURANCE_COMPANY_TYPE_OPTIONS;
  readonly activeColumns = ['insuranceType', 'companyName', 'createdBy', 'createdAt', 'edit', 'deactivate'];
  readonly inactiveColumns = ['insuranceType', 'companyName', 'deactivatedBy', 'deactivatedAt', 'edit', 'activate'];

  activeCompanies = signal<InsuranceCompany[]>([]);
  inactiveCompanies = signal<InsuranceCompany[]>([]);
  loadingActive = signal(false);
  loadingInactive = signal(false);
  saving = signal(false);

  editingId = signal<number | null>(null);
  form: InsuranceCompanyInput = { ...EMPTY_FORM };

  constructor() {
    this.refreshActive();
    this.refreshInactive();
  }

  refreshActive(): void {
    this.loadingActive.set(true);
    this.service.list().subscribe({
      next: (companies) => {
        this.activeCompanies.set(companies);
        this.loadingActive.set(false);
      },
      error: () => {
        this.loadingActive.set(false);
        this.notification.error('Failed to load insurance companies.');
      }
    });
  }

  refreshInactive(): void {
    this.loadingInactive.set(true);
    this.service.listInactive().subscribe({
      next: (companies) => {
        this.inactiveCompanies.set(companies);
        this.loadingInactive.set(false);
      },
      error: () => {
        this.loadingInactive.set(false);
        this.notification.error('Failed to load deactivated insurance companies.');
      }
    });
  }

  edit(company: InsuranceCompany): void {
    if (company.id === null) {
      return;
    }
    this.editingId.set(company.id);
    this.form = { insuranceType: company.insuranceType, companyName: company.companyName };
  }

  clear(): void {
    this.editingId.set(null);
    this.form = { ...EMPTY_FORM };
  }

  submit(): void {
    if (!this.form.insuranceType || !this.form.companyName.trim()) {
      return;
    }
    this.saving.set(true);
    const id = this.editingId();
    const request = id !== null ? this.service.update(id, this.form) : this.service.create(this.form);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.notification.success(id !== null ? 'Insurance company updated.' : 'Insurance company added.');
        this.clear();
        this.refreshActive();
        this.refreshInactive();
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err.error?.message ?? 'Failed to save the insurance company.');
      }
    });
  }

  deactivate(company: InsuranceCompany): void {
    if (company.id === null) {
      return;
    }
    this.confirmDialog
      .confirm({
        title: `Deactivate ${company.companyName}?`,
        message: 'This company will no longer be selectable elsewhere. This can be reversed later.',
        confirmLabel: 'Deactivate',
        destructive: true
      })
      .subscribe((confirmed) => {
        if (!confirmed || company.id === null) {
          return;
        }
        this.service.deactivate(company.id).subscribe({
          next: () => {
            this.notification.success('Insurance company deactivated.');
            this.refreshActive();
            this.refreshInactive();
          },
          error: (err) => this.notification.error(err.error?.message ?? 'Failed to deactivate the insurance company.')
        });
      });
  }

  restore(company: InsuranceCompany): void {
    if (company.id === null) {
      return;
    }
    this.service.restore(company.id).subscribe({
      next: () => {
        this.notification.success('Insurance company restored.');
        this.refreshActive();
        this.refreshInactive();
      },
      error: () => this.notification.error('Failed to restore the insurance company.')
    });
  }
}
