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
import { CmsBlogPost, CmsBlogPostInput } from './cms-blog-post.model';
import { CmsBlogPostService } from './cms-blog-post.service';

const EMPTY_FORM: CmsBlogPostInput = { title: '', slug: '', body: '' };

function slugify(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Website Blog Posts: inline Title/Slug/Body Add/Update/Clear form (Slug
 * auto-derives from Title until the user edits it directly) plus
 * cover-image upload per row, Active/Deactivated tables.
 */
@Component({
  selector: 'app-cms-blog-post-list',
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
  templateUrl: './cms-blog-post-list.component.html',
  styleUrl: './cms-blog-post-list.component.scss'
})
export class CmsBlogPostListComponent {
  private readonly service = inject(CmsBlogPostService);
  private readonly notification = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly activeColumns = ['image', 'title', 'slug', 'publishedAt', 'actions'];
  readonly inactiveColumns = ['image', 'title', 'slug', 'publishedAt', 'actions'];

  activeItems = signal<CmsBlogPost[]>([]);
  inactiveItems = signal<CmsBlogPost[]>([]);
  loadingActive = signal(false);
  loadingInactive = signal(false);
  saving = signal(false);
  uploadingId = signal<number | null>(null);

  editingId = signal<number | null>(null);
  form: CmsBlogPostInput = { ...EMPTY_FORM };
  private slugTouched = false;

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
        this.notification.error('Failed to load blog posts.');
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
        this.notification.error('Failed to load deactivated blog posts.');
      }
    });
  }

  onTitleChange(): void {
    if (!this.slugTouched) {
      this.form.slug = slugify(this.form.title);
    }
  }

  onSlugChange(): void {
    this.slugTouched = true;
  }

  edit(item: CmsBlogPost): void {
    if (item.id === null) {
      return;
    }
    this.editingId.set(item.id);
    this.slugTouched = true;
    this.form = { title: item.title, slug: item.slug, body: item.body };
  }

  clear(): void {
    this.editingId.set(null);
    this.slugTouched = false;
    this.form = { ...EMPTY_FORM };
  }

  submit(): void {
    if (!this.form.title.trim() || !this.form.slug.trim()) {
      return;
    }
    this.saving.set(true);
    const id = this.editingId();
    const request = id !== null ? this.service.update(id, this.form) : this.service.create(this.form);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.notification.success(id !== null ? 'Blog post updated.' : 'Blog post added.');
        this.clear();
        this.refreshActive();
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err.error?.message ?? 'Failed to save blog post.');
      }
    });
  }

  onImageSelected(item: CmsBlogPost, event: Event): void {
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

  deactivate(item: CmsBlogPost): void {
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
            this.notification.success('Blog post deactivated.');
            this.refreshActive();
            this.refreshInactive();
          },
          error: (err) => this.notification.error(err.error?.message ?? 'Failed to deactivate blog post.')
        });
      });
  }

  restore(item: CmsBlogPost): void {
    if (item.id === null) {
      return;
    }
    this.service.restore(item.id).subscribe({
      next: () => {
        this.notification.success('Blog post restored.');
        this.refreshActive();
        this.refreshInactive();
      },
      error: () => this.notification.error('Failed to restore blog post.')
    });
  }
}
