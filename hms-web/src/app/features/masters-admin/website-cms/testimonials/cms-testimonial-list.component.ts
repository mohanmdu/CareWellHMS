import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { ConfirmDialogService } from '../../../../shared/services/confirm-dialog.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';
import { CmsTestimonial, CmsTestimonialInput } from './cms-testimonial.model';
import { CmsTestimonialService } from './cms-testimonial.service';

const EMPTY_FORM: CmsTestimonialInput = { patientName: '', quote: '', rating: 5 };
const RATING_OPTIONS = [1, 2, 3, 4, 5];

/**
 * Website Testimonials: inline Patient Name/Quote/Rating Add/Update/Clear
 * form plus photo upload per row, Active/Deactivated tables.
 */
@Component({
  selector: 'app-cms-testimonial-list',
  standalone: true,
  imports: [
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
  templateUrl: './cms-testimonial-list.component.html',
  styleUrl: './cms-testimonial-list.component.scss'
})
export class CmsTestimonialListComponent {
  private readonly service = inject(CmsTestimonialService);
  private readonly notification = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly ratingOptions = RATING_OPTIONS;
  readonly activeColumns = ['photo', 'patientName', 'rating', 'quote', 'actions'];
  readonly inactiveColumns = ['photo', 'patientName', 'rating', 'quote', 'actions'];

  activeItems = signal<CmsTestimonial[]>([]);
  inactiveItems = signal<CmsTestimonial[]>([]);
  loadingActive = signal(false);
  loadingInactive = signal(false);
  saving = signal(false);
  uploadingId = signal<number | null>(null);

  editingId = signal<number | null>(null);
  form: CmsTestimonialInput = { ...EMPTY_FORM };

  constructor() {
    this.refreshActive();
    this.refreshInactive();
  }

  refreshActive(): void {
    this.loadingActive.set(true);
    this.service.list().subscribe({
      next: (items) => {
        this.activeItems.set(items);
        this.loadingActive.set(false);
      },
      error: () => {
        this.loadingActive.set(false);
        this.notification.error('Failed to load testimonials.');
      }
    });
  }

  refreshInactive(): void {
    this.loadingInactive.set(true);
    this.service.listInactive().subscribe({
      next: (items) => {
        this.inactiveItems.set(items);
        this.loadingInactive.set(false);
      },
      error: () => {
        this.loadingInactive.set(false);
        this.notification.error('Failed to load deactivated testimonials.');
      }
    });
  }

  edit(item: CmsTestimonial): void {
    if (item.id === null) {
      return;
    }
    this.editingId.set(item.id);
    this.form = { patientName: item.patientName, quote: item.quote, rating: item.rating };
  }

  clear(): void {
    this.editingId.set(null);
    this.form = { ...EMPTY_FORM };
  }

  submit(): void {
    if (!this.form.patientName.trim() || !this.form.quote.trim()) {
      return;
    }
    this.saving.set(true);
    const id = this.editingId();
    const request = id !== null ? this.service.update(id, this.form) : this.service.create(this.form);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.notification.success(id !== null ? 'Testimonial updated.' : 'Testimonial added.');
        this.clear();
        this.refreshActive();
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err.error?.message ?? 'Failed to save testimonial.');
      }
    });
  }

  onImageSelected(item: CmsTestimonial, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file || item.id === null) {
      return;
    }
    this.uploadingId.set(item.id);
    this.service.uploadImage(item.id, file).subscribe({
      next: () => {
        this.uploadingId.set(null);
        this.notification.success('Photo updated.');
        this.refreshActive();
      },
      error: () => {
        this.uploadingId.set(null);
        this.notification.error('Failed to upload photo.');
      }
    });
  }

  deactivate(item: CmsTestimonial): void {
    if (item.id === null) {
      return;
    }
    this.confirmDialog
      .confirm({
        title: `Deactivate ${item.patientName}'s testimonial?`,
        message: 'It will no longer be shown on the public website. This can be reversed later.',
        confirmLabel: 'Deactivate',
        destructive: true
      })
      .subscribe((confirmed) => {
        if (!confirmed || item.id === null) {
          return;
        }
        this.service.deactivate(item.id).subscribe({
          next: () => {
            this.notification.success('Testimonial deactivated.');
            this.refreshActive();
            this.refreshInactive();
          },
          error: (err) => this.notification.error(err.error?.message ?? 'Failed to deactivate testimonial.')
        });
      });
  }

  restore(item: CmsTestimonial): void {
    if (item.id === null) {
      return;
    }
    this.service.restore(item.id).subscribe({
      next: () => {
        this.notification.success('Testimonial restored.');
        this.refreshActive();
        this.refreshInactive();
      },
      error: () => this.notification.error('Failed to restore testimonial.')
    });
  }
}
