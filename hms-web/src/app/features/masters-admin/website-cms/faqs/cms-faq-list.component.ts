import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { ConfirmDialogService } from '../../../../shared/services/confirm-dialog.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';
import { CmsFaq, CmsFaqInput } from './cms-faq.model';
import { CmsFaqService } from './cms-faq.service';

const EMPTY_FORM: CmsFaqInput = { question: '', answer: '', sortOrder: null };

/**
 * Website FAQs: inline Question/Answer/Sort Order Add/Update/Clear form
 * (matching the Room Types screen's layout) plus Active/Deactivated tables.
 */
@Component({
  selector: 'app-cms-faq-list',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    PageHeaderComponent,
    EmptyStateComponent
  ],
  templateUrl: './cms-faq-list.component.html',
  styleUrl: './cms-faq-list.component.scss'
})
export class CmsFaqListComponent {
  private readonly service = inject(CmsFaqService);
  private readonly notification = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly activeColumns = ['sortOrder', 'question', 'answer', 'actions'];
  readonly inactiveColumns = ['sortOrder', 'question', 'answer', 'actions'];

  activeFaqs = signal<CmsFaq[]>([]);
  inactiveFaqs = signal<CmsFaq[]>([]);
  loadingActive = signal(false);
  loadingInactive = signal(false);
  saving = signal(false);

  editingId = signal<number | null>(null);
  form: CmsFaqInput = { ...EMPTY_FORM };

  constructor() {
    this.refreshActive();
    this.refreshInactive();
  }

  refreshActive(): void {
    this.loadingActive.set(true);
    this.service.list().subscribe({
      next: (faqs) => {
        this.activeFaqs.set(faqs);
        this.loadingActive.set(false);
      },
      error: () => {
        this.loadingActive.set(false);
        this.notification.error('Failed to load FAQs.');
      }
    });
  }

  refreshInactive(): void {
    this.loadingInactive.set(true);
    this.service.listInactive().subscribe({
      next: (faqs) => {
        this.inactiveFaqs.set(faqs);
        this.loadingInactive.set(false);
      },
      error: () => {
        this.loadingInactive.set(false);
        this.notification.error('Failed to load deactivated FAQs.');
      }
    });
  }

  edit(faq: CmsFaq): void {
    if (faq.id === null) {
      return;
    }
    this.editingId.set(faq.id);
    this.form = { question: faq.question, answer: faq.answer, sortOrder: faq.sortOrder };
  }

  clear(): void {
    this.editingId.set(null);
    this.form = { ...EMPTY_FORM };
  }

  submit(): void {
    if (!this.form.question.trim() || !this.form.answer.trim()) {
      return;
    }
    this.saving.set(true);
    const id = this.editingId();
    const request = id !== null ? this.service.update(id, this.form) : this.service.create(this.form);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.notification.success(id !== null ? 'FAQ updated.' : 'FAQ added.');
        this.clear();
        this.refreshActive();
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err.error?.message ?? 'Failed to save FAQ.');
      }
    });
  }

  deactivate(faq: CmsFaq): void {
    if (faq.id === null) {
      return;
    }
    this.confirmDialog
      .confirm({
        title: `Deactivate this FAQ?`,
        message: 'It will no longer be shown on the public website. This can be reversed later.',
        confirmLabel: 'Deactivate',
        destructive: true
      })
      .subscribe((confirmed) => {
        if (!confirmed || faq.id === null) {
          return;
        }
        this.service.deactivate(faq.id).subscribe({
          next: () => {
            this.notification.success('FAQ deactivated.');
            this.refreshActive();
            this.refreshInactive();
          },
          error: (err) => this.notification.error(err.error?.message ?? 'Failed to deactivate FAQ.')
        });
      });
  }

  restore(faq: CmsFaq): void {
    if (faq.id === null) {
      return;
    }
    this.service.restore(faq.id).subscribe({
      next: () => {
        this.notification.success('FAQ restored.');
        this.refreshActive();
        this.refreshInactive();
      },
      error: () => this.notification.error('Failed to restore FAQ.')
    });
  }
}
