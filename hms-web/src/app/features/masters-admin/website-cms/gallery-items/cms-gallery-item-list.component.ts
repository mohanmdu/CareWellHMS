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
import { CmsGalleryItem, CmsGalleryItemInput } from './cms-gallery-item.model';
import { CmsGalleryItemService } from './cms-gallery-item.service';

const EMPTY_FORM: CmsGalleryItemInput = { type: 'PHOTO', title: '', mediaPathOrUrl: '', album: '' };

/**
 * Website Gallery: inline Type/Title/Album Add/Update/Clear form. VIDEO items
 * take a plain URL (YouTube/Vimeo) entered directly in the form; PHOTO items
 * have their image uploaded per-row after the item exists, same two-step
 * pattern as Banner Slides.
 */
@Component({
  selector: 'app-cms-gallery-item-list',
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
  templateUrl: './cms-gallery-item-list.component.html',
  styleUrl: './cms-gallery-item-list.component.scss'
})
export class CmsGalleryItemListComponent {
  private readonly service = inject(CmsGalleryItemService);
  private readonly notification = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly activeColumns = ['media', 'type', 'title', 'album', 'actions'];
  readonly inactiveColumns = ['media', 'type', 'title', 'album', 'actions'];

  activeItems = signal<CmsGalleryItem[]>([]);
  inactiveItems = signal<CmsGalleryItem[]>([]);
  loadingActive = signal(false);
  loadingInactive = signal(false);
  saving = signal(false);
  uploadingId = signal<number | null>(null);

  editingId = signal<number | null>(null);
  form: CmsGalleryItemInput = { ...EMPTY_FORM };

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
        this.notification.error('Failed to load gallery items.');
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
        this.notification.error('Failed to load deactivated gallery items.');
      }
    });
  }

  edit(item: CmsGalleryItem): void {
    if (item.id === null) {
      return;
    }
    this.editingId.set(item.id);
    this.form = {
      type: item.type,
      title: item.title,
      mediaPathOrUrl: item.type === 'VIDEO' ? item.mediaPathOrUrl : '',
      album: item.album
    };
  }

  clear(): void {
    this.editingId.set(null);
    this.form = { ...EMPTY_FORM };
  }

  submit(): void {
    if (this.form.type === 'VIDEO' && !this.form.mediaPathOrUrl?.trim()) {
      return;
    }
    this.saving.set(true);
    const id = this.editingId();
    const request = id !== null ? this.service.update(id, this.form) : this.service.create(this.form);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.notification.success(id !== null ? 'Gallery item updated.' : 'Gallery item added.');
        this.clear();
        this.refreshActive();
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err.error?.message ?? 'Failed to save gallery item.');
      }
    });
  }

  onImageSelected(item: CmsGalleryItem, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file || item.id === null) {
      return;
    }
    this.uploadingId.set(item.id);
    this.service.uploadImage(item.id, file).subscribe({
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

  deactivate(item: CmsGalleryItem): void {
    if (item.id === null) {
      return;
    }
    this.confirmDialog
      .confirm({
        title: `Deactivate this gallery item?`,
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
            this.notification.success('Gallery item deactivated.');
            this.refreshActive();
            this.refreshInactive();
          },
          error: (err) => this.notification.error(err.error?.message ?? 'Failed to deactivate gallery item.')
        });
      });
  }

  restore(item: CmsGalleryItem): void {
    if (item.id === null) {
      return;
    }
    this.service.restore(item.id).subscribe({
      next: () => {
        this.notification.success('Gallery item restored.');
        this.refreshActive();
        this.refreshInactive();
      },
      error: () => this.notification.error('Failed to restore gallery item.')
    });
  }
}
