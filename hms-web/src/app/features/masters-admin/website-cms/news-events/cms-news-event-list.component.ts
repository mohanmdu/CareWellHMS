import { DatePipe } from '@angular/common';
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
import { CmsNewsEvent, CmsNewsEventInput } from './cms-news-event.model';
import { CmsNewsEventService } from './cms-news-event.service';

const EMPTY_FORM: CmsNewsEventInput = { title: '', body: '', eventDate: null };

/**
 * Website News & Events: inline Title/Body/Event Date Add/Update/Clear form
 * plus cover-image upload per row, Active/Deactivated tables. eventDate is
 * left blank for plain news items (only real events set it).
 */
@Component({
  selector: 'app-cms-news-event-list',
  standalone: true,
  imports: [
    DatePipe,
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
  templateUrl: './cms-news-event-list.component.html',
  styleUrl: './cms-news-event-list.component.scss'
})
export class CmsNewsEventListComponent {
  private readonly service = inject(CmsNewsEventService);
  private readonly notification = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly activeColumns = ['image', 'title', 'eventDate', 'publishedAt', 'actions'];
  readonly inactiveColumns = ['image', 'title', 'eventDate', 'publishedAt', 'actions'];

  activeItems = signal<CmsNewsEvent[]>([]);
  inactiveItems = signal<CmsNewsEvent[]>([]);
  loadingActive = signal(false);
  loadingInactive = signal(false);
  saving = signal(false);
  uploadingId = signal<number | null>(null);

  editingId = signal<number | null>(null);
  form: CmsNewsEventInput = { ...EMPTY_FORM };

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
        this.notification.error('Failed to load news & events.');
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
        this.notification.error('Failed to load deactivated news & events.');
      }
    });
  }

  edit(item: CmsNewsEvent): void {
    if (item.id === null) {
      return;
    }
    this.editingId.set(item.id);
    this.form = { title: item.title, body: item.body, eventDate: item.eventDate };
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
        this.notification.success(id !== null ? 'News/event updated.' : 'News/event added.');
        this.clear();
        this.refreshActive();
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err.error?.message ?? 'Failed to save news/event.');
      }
    });
  }

  onImageSelected(item: CmsNewsEvent, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file || item.id === null) {
      return;
    }
    this.uploadingId.set(item.id);
    this.service.uploadImage(item.id, file).subscribe({
      next: () => {
        this.uploadingId.set(null);
        this.notification.success('Cover image updated.');
        this.refreshActive();
      },
      error: () => {
        this.uploadingId.set(null);
        this.notification.error('Failed to upload cover image.');
      }
    });
  }

  deactivate(item: CmsNewsEvent): void {
    if (item.id === null) {
      return;
    }
    this.confirmDialog
      .confirm({
        title: `Deactivate ${item.title}?`,
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
            this.notification.success('News/event deactivated.');
            this.refreshActive();
            this.refreshInactive();
          },
          error: (err) => this.notification.error(err.error?.message ?? 'Failed to deactivate news/event.')
        });
      });
  }

  restore(item: CmsNewsEvent): void {
    if (item.id === null) {
      return;
    }
    this.service.restore(item.id).subscribe({
      next: () => {
        this.notification.success('News/event restored.');
        this.refreshActive();
        this.refreshInactive();
      },
      error: () => this.notification.error('Failed to restore news/event.')
    });
  }
}
