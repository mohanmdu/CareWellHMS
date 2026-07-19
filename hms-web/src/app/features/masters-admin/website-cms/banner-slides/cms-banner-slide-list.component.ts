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
import { CmsBannerSlide, CmsBannerSlideInput } from './cms-banner-slide.model';
import { CmsBannerSlideService } from './cms-banner-slide.service';

const EMPTY_FORM: CmsBannerSlideInput = { title: '', subtitle: '', linkUrl: '', sortOrder: null };

/**
 * Website Banner Slides (homepage carousel): inline Title/Subtitle/Link
 * URL/Sort Order Add/Update/Clear form plus Active/Deactivated tables with a
 * thumbnail column. Images are uploaded per-row after a slide exists (a
 * banner needs an id before FileStorageService can store its image), the
 * same two-step pattern as Consultant/Admission photo uploads.
 */
@Component({
  selector: 'app-cms-banner-slide-list',
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
  templateUrl: './cms-banner-slide-list.component.html',
  styleUrl: './cms-banner-slide-list.component.scss'
})
export class CmsBannerSlideListComponent {
  private readonly service = inject(CmsBannerSlideService);
  private readonly notification = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly activeColumns = ['image', 'sortOrder', 'title', 'subtitle', 'actions'];
  readonly inactiveColumns = ['image', 'sortOrder', 'title', 'subtitle', 'actions'];

  activeSlides = signal<CmsBannerSlide[]>([]);
  inactiveSlides = signal<CmsBannerSlide[]>([]);
  loadingActive = signal(false);
  loadingInactive = signal(false);
  saving = signal(false);
  uploadingId = signal<number | null>(null);

  editingId = signal<number | null>(null);
  form: CmsBannerSlideInput = { ...EMPTY_FORM };

  constructor() {
    this.refreshActive();
    this.refreshInactive();
  }

  refreshActive(): void {
    this.loadingActive.set(true);
    this.service.list().subscribe({
      next: (slides) => {
        this.activeSlides.set(slides);
        this.loadingActive.set(false);
      },
      error: () => {
        this.loadingActive.set(false);
        this.notification.error('Failed to load banner slides.');
      }
    });
  }

  refreshInactive(): void {
    this.loadingInactive.set(true);
    this.service.listInactive().subscribe({
      next: (slides) => {
        this.inactiveSlides.set(slides);
        this.loadingInactive.set(false);
      },
      error: () => {
        this.loadingInactive.set(false);
        this.notification.error('Failed to load deactivated banner slides.');
      }
    });
  }

  edit(slide: CmsBannerSlide): void {
    if (slide.id === null) {
      return;
    }
    this.editingId.set(slide.id);
    this.form = { title: slide.title, subtitle: slide.subtitle, linkUrl: slide.linkUrl, sortOrder: slide.sortOrder };
  }

  clear(): void {
    this.editingId.set(null);
    this.form = { ...EMPTY_FORM };
  }

  submit(): void {
    if (!this.form.title.trim()) {
      return;
    }
    this.saving.set(true);
    const id = this.editingId();
    const request = id !== null ? this.service.update(id, this.form) : this.service.create(this.form);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.notification.success(id !== null ? 'Banner slide updated.' : 'Banner slide added.');
        this.clear();
        this.refreshActive();
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err.error?.message ?? 'Failed to save banner slide.');
      }
    });
  }

  onImageSelected(slide: CmsBannerSlide, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file || slide.id === null) {
      return;
    }
    this.uploadingId.set(slide.id);
    this.service.uploadImage(slide.id, file).subscribe({
      next: () => {
        this.uploadingId.set(null);
        this.notification.success('Image updated.');
        this.refreshActive();
      },
      error: () => {
        this.uploadingId.set(null);
        this.notification.error('Failed to upload image.');
      }
    });
  }

  deactivate(slide: CmsBannerSlide): void {
    if (slide.id === null) {
      return;
    }
    this.confirmDialog
      .confirm({
        title: `Deactivate ${slide.title}?`,
        message: 'It will no longer be shown on the public website. This can be reversed later.',
        confirmLabel: 'Deactivate',
        destructive: true
      })
      .subscribe((confirmed) => {
        if (!confirmed || slide.id === null) {
          return;
        }
        this.service.deactivate(slide.id).subscribe({
          next: () => {
            this.notification.success('Banner slide deactivated.');
            this.refreshActive();
            this.refreshInactive();
          },
          error: (err) => this.notification.error(err.error?.message ?? 'Failed to deactivate banner slide.')
        });
      });
  }

  restore(slide: CmsBannerSlide): void {
    if (slide.id === null) {
      return;
    }
    this.service.restore(slide.id).subscribe({
      next: () => {
        this.notification.success('Banner slide restored.');
        this.refreshActive();
        this.refreshInactive();
      },
      error: () => this.notification.error('Failed to restore banner slide.')
    });
  }
}
