import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { NotificationService } from '../../shared/services/notification.service';
import { REVENUE_BUCKET_OPTIONS } from '../../shared/revenue-bucket.model';
import { TablePagination } from '../../shared/table/table-pagination';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { LabCategory, LabCategoryInput } from './lab.model';
import { LabCategoryService } from './lab-category.service';

const BLANK_FORM: LabCategoryInput = { name: '', opAmount: 0, ipAmount: 0, orderingNo: 0, revenueBucket: 'LAB' };

/**
 * Lab Category master (top of Category -> Sub-Category -> Component). One
 * inline form pinned at the top doubles as Add and Edit (matches the
 * reference exactly - no MatDialog), and Delete is a real hard delete that
 * cascades through sub-categories/components on the backend, so it's gated
 * behind a confirm dialog that warns when children exist.
 */
@Component({
  selector: 'app-lab-category-list',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatIconModule, MatPaginatorModule, MatProgressBarModule, EmptyStateComponent],
  templateUrl: './lab-category-list.component.html',
  styleUrl: './lab-category-list.component.scss'
})
export class LabCategoryListComponent {
  private readonly service = inject(LabCategoryService);
  private readonly notification = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly revenueBucketOptions = REVENUE_BUCKET_OPTIONS;

  categories = signal<LabCategory[]>([]);
  loading = signal(false);
  searchTerm = signal('');
  editingId: number | null = null;
  form: LabCategoryInput = { ...BLANK_FORM };

  filteredCategories = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return this.categories();
    }
    return this.categories().filter((c) => c.name.toLowerCase().includes(term));
  });

  pagination = new TablePagination(this.filteredCategories);

  constructor() {
    this.refresh();
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.pagination.reset();
  }

  onPageSizeChange(size: number): void {
    this.pagination.pageSize.set(size);
    this.pagination.reset();
  }

  refresh(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.pagination.reset();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load lab categories.');
      }
    });
  }

  get isValid(): boolean {
    return this.form.name.trim().length > 0;
  }

  revenueBucketLabel(category: LabCategory): string {
    return this.revenueBucketOptions.find((option) => option.value === category.revenueBucket)?.label ?? category.revenueBucket;
  }

  submit(): void {
    if (!this.isValid) {
      return;
    }
    const input: LabCategoryInput = { ...this.form, name: this.form.name.trim() };
    const save$ = this.editingId ? this.service.update(this.editingId, input) : this.service.create(input);
    save$.subscribe({
      next: () => {
        this.notification.success(this.editingId ? 'Category updated.' : 'Category added.');
        this.resetForm();
        this.refresh();
      },
      error: (err) => this.notification.error(err.error?.message ?? 'Failed to save the category.')
    });
  }

  edit(category: LabCategory): void {
    this.editingId = category.id;
    this.form = {
      name: category.name,
      opAmount: category.opAmount,
      ipAmount: category.ipAmount,
      orderingNo: category.orderingNo,
      revenueBucket: category.revenueBucket
    };
  }

  cancelEdit(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.editingId = null;
    this.form = { ...BLANK_FORM };
  }

  remove(category: LabCategory): void {
    const childWarning =
      category.subCategoryCount > 0
        ? ` This will also delete its ${category.subCategoryCount} sub-categor${category.subCategoryCount === 1 ? 'y' : 'ies'} and ${category.componentCount} component(s).`
        : '';
    this.confirmDialog
      .confirm({
        title: `Delete ${category.name}?`,
        message: `This cannot be undone.${childWarning}`,
        confirmLabel: 'Delete',
        destructive: true
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.service.delete(category.id).subscribe({
          next: () => {
            this.notification.success('Category deleted.');
            if (this.editingId === category.id) {
              this.resetForm();
            }
            this.refresh();
          },
          error: () => this.notification.error('Failed to delete the category.')
        });
      });
  }
}
