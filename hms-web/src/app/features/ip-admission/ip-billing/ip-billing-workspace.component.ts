import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin, Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { PromptDialogService } from '../../../shared/services/prompt-dialog.service';
import { Consultant } from '../../masters-admin/consultants/consultant.model';
import { ConsultantService } from '../../masters-admin/consultants/consultant.service';
import { IpBillingCategory } from '../../masters-admin/ip-billing-categories/ip-billing-category.model';
import { IpBillingCategoryService } from '../../masters-admin/ip-billing-categories/ip-billing-category.service';
import { IpBillingComponent as IpBillingComponentMaster } from '../../masters-admin/ip-billing-components/ip-billing-component.model';
import { IpBillingComponentService } from '../../masters-admin/ip-billing-components/ip-billing-component.service';
import { Admission } from '../admissions/admission.model';
import { AdmissionService } from '../admissions/admission.service';
import { IpBillingLedger, IpBillingLineItem, IpPayment } from './ip-billing.model';
import { IpBillingService } from './ip-billing.service';

interface BufferRow {
  categoryId: number;
  categoryName: string;
  consultantId: number | null;
  consultantName: string | null;
  componentId: number;
  componentName: string;
  remarks: string;
  quantity: number;
  unitAmount: number;
  units: string;
  total: number;
}

const UNIT_OPTIONS = ['Each', 'Day', 'Hour', 'Session'];

/**
 * Patient Billing Advice / BILLING ledger (PDF p.11-12) - a bespoke per-admission
 * billing workspace, deliberately parallel to (not built on top of) the
 * generic Invoice system, per explicit direction. New entries are buffered
 * client-side until "Confirm" persists them all as real IpBillingLineItems.
 */
@Component({
  selector: 'app-ip-billing-workspace',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './ip-billing-workspace.component.html',
  styleUrl: './ip-billing-workspace.component.scss'
})
export class IpBillingWorkspaceComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly admissionService = inject(AdmissionService);
  private readonly billingService = inject(IpBillingService);
  private readonly categoryService = inject(IpBillingCategoryService);
  private readonly componentService = inject(IpBillingComponentService);
  private readonly consultantService = inject(ConsultantService);
  private readonly notification = inject(NotificationService);
  private readonly promptDialog = inject(PromptDialogService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly unitOptions = UNIT_OPTIONS;
  private readonly admissionId = Number(this.route.snapshot.paramMap.get('id'));

  admission = signal<Admission | null>(null);
  ledger = signal<IpBillingLedger | null>(null);
  payments = signal<IpPayment[]>([]);
  categories = signal<IpBillingCategory[]>([]);
  components = signal<IpBillingComponentMaster[]>([]);
  consultants = signal<Consultant[]>([]);
  loading = signal(true);
  confirming = signal(false);

  expandedCategories = signal<Set<string>>(new Set());
  buffer = signal<BufferRow[]>([]);

  form = {
    categoryId: null as number | null,
    consultantId: null as number | null,
    componentId: null as number | null,
    remarks: '',
    quantity: 1,
    unitAmount: 0,
    units: 'Each'
  };

  formTotal = computed(() => this.form.quantity * this.form.unitAmount);

  availableAmount = computed(() => {
    const admission = this.admission();
    const ledger = this.ledger();
    if (!admission || !ledger) {
      return 0;
    }
    return Math.max((admission.advanceAmount ?? 0) - ledger.netTotal, 0);
  });

  constructor() {
    this.refreshAll();
    this.categoryService.list().subscribe({ next: (categories) => this.categories.set(categories) });
    this.componentService.list().subscribe({ next: (components) => this.components.set(components) });
    this.consultantService.list().subscribe({ next: (consultants) => this.consultants.set(consultants) });
  }

  refreshAll(): void {
    this.loading.set(true);
    this.admissionService.get(this.admissionId).subscribe({
      next: (admission) => {
        this.admission.set(admission);
        this.refreshLedgerAndPayments();
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the admission.');
      }
    });
  }

  private refreshLedgerAndPayments(): void {
    forkJoin({
      ledger: this.billingService.getLedger(this.admissionId),
      payments: this.billingService.listPayments(this.admissionId)
    }).subscribe({
      next: ({ ledger, payments }) => {
        this.ledger.set(ledger);
        this.payments.set(payments);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load the billing ledger.');
      }
    });
  }

  onComponentChange(componentId: number | null): void {
    const component = this.components().find((c) => c.id === componentId);
    if (!component) {
      return;
    }
    const admission = this.admission();
    this.form.unitAmount = admission?.paymentType === 'INSURANCE' ? component.insuranceAmount : component.ipAmount;
    this.form.categoryId = component.categoryId;
  }

  addToBuffer(): void {
    const category = this.categories().find((c) => c.id === this.form.categoryId);
    const component = this.components().find((c) => c.id === this.form.componentId);
    if (!category || !component || this.form.quantity <= 0) {
      return;
    }
    const consultant = this.consultants().find((c) => c.id === this.form.consultantId);
    this.buffer.update((rows) => [
      ...rows,
      {
        categoryId: category.id!,
        categoryName: category.name,
        consultantId: consultant?.id ?? null,
        consultantName: consultant?.name ?? null,
        componentId: component.id!,
        componentName: component.name,
        remarks: this.form.remarks.trim(),
        quantity: this.form.quantity,
        unitAmount: this.form.unitAmount,
        units: this.form.units,
        total: this.formTotal()
      }
    ]);
    this.form = { categoryId: null, consultantId: null, componentId: null, remarks: '', quantity: 1, unitAmount: 0, units: 'Each' };
  }

  removeFromBuffer(index: number): void {
    this.buffer.update((rows) => rows.filter((_, i) => i !== index));
  }

  confirmBuffer(): void {
    const rows = this.buffer();
    if (rows.length === 0) {
      return;
    }
    this.confirming.set(true);
    const requests: Observable<IpBillingLineItem>[] = rows.map((row) =>
      this.billingService.addLineItem(this.admissionId, {
        categoryId: row.categoryId,
        consultantId: row.consultantId,
        componentId: row.componentId,
        remarks: row.remarks || null,
        quantity: row.quantity,
        unitAmount: row.unitAmount,
        units: row.units
      })
    );
    forkJoin(requests).subscribe({
      next: () => {
        this.confirming.set(false);
        this.buffer.set([]);
        this.notification.success('Billing entries confirmed.');
        this.refreshLedgerAndPayments();
      },
      error: (err) => {
        this.confirming.set(false);
        this.notification.error(err.error?.message ?? 'Failed to confirm billing entries.');
      }
    });
  }

  toggleCategory(category: string): void {
    this.expandedCategories.update((set) => {
      const next = new Set(set);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }

  editLineItem(item: IpBillingLineItem): void {
    this.promptDialog
      .prompt({
        title: `Edit charge - ${item.componentName}`,
        fields: [
          { key: 'quantity', label: 'Quantity', type: 'number', required: true, min: 1, initialValue: item.quantity },
          { key: 'unitAmount', label: 'Rate', type: 'number', required: true, min: 0, initialValue: item.unitAmount },
          { key: 'discountAmount', label: 'Discount', type: 'number', min: 0, initialValue: item.discountAmount },
          { key: 'discountReason', label: 'Discount Reason', type: 'text', initialValue: item.discountReason ?? '' }
        ],
        confirmLabel: 'Save'
      })
      .subscribe((values) => {
        if (!values || item.id === null) {
          return;
        }
        this.billingService
          .updateLineItem(item.id, {
            quantity: values['quantity'] as number,
            unitAmount: values['unitAmount'] as number,
            discountAmount: values['discountAmount'] as number,
            discountReason: values['discountReason'] as string
          })
          .subscribe({
            next: () => {
              this.notification.success('Charge updated.');
              this.refreshLedgerAndPayments();
            },
            error: (err) => this.notification.error(err.error?.message ?? 'Failed to update charge.')
          });
      });
  }

  deleteLineItem(item: IpBillingLineItem): void {
    if (item.id === null) {
      return;
    }
    this.confirmDialog
      .confirm({
        title: `Delete ${item.componentName}?`,
        message: 'This billed charge will be permanently removed from the ledger.',
        confirmLabel: 'Delete',
        destructive: true
      })
      .subscribe((confirmed) => {
        if (!confirmed || item.id === null) {
          return;
        }
        this.billingService.deleteLineItem(item.id).subscribe({
          next: () => {
            this.notification.success('Charge deleted.');
            this.refreshLedgerAndPayments();
          },
          error: () => this.notification.error('Failed to delete charge.')
        });
      });
  }

  amountReceived(): void {
    const admission = this.admission();
    if (!admission || admission.id === null) {
      return;
    }
    this.promptDialog
      .prompt({
        title: `Amount Received - ${admission.admissionNumber}`,
        fields: [{ key: 'amount', label: 'Amount', type: 'number', required: true, min: 0 }]
      })
      .subscribe((values) => {
        if (!values || admission.id === null) {
          return;
        }
        const amount = values['amount'] as number;
        if (!amount || amount <= 0) {
          return;
        }
        this.admissionService.addAdvancePayment(admission.id, amount).subscribe({
          next: () => {
            this.notification.success('Payment recorded.');
            this.refreshAll();
          },
          error: (err) => this.notification.error(err.error?.message ?? 'Failed to record payment.')
        });
      });
  }

  printAdmissionSlip(): void {
    window.print();
  }

  initials(): string {
    return (this.admission()?.patientName ?? '?').trim().charAt(0).toUpperCase();
  }
}
