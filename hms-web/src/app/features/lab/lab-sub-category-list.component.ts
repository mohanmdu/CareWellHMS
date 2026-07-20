import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { NotificationService } from '../../shared/services/notification.service';
import { TablePagination } from '../../shared/table/table-pagination';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { LabCategory, LabSubCategory } from './lab.model';
import { LabCategoryService } from './lab-category.service';
import { LabSubCategoryService } from './lab-sub-category.service';

interface SubCategoryForm {
  name: string;
  opAmount: number;
  ipAmount: number;
  notes: string;
  orderingNo: number;
  heading: string;
}

const BLANK_FORM: SubCategoryForm = { name: '', opAmount: 0, ipAmount: 0, notes: '', orderingNo: 0, heading: '' };

/** Lab Sub-Category master: one inline top form (Add/Edit) + table, scoped to a searchable LabCategory. */
@Component({
  selector: 'app-lab-sub-category-list',
  standalone: true,
  imports: [
    FormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressBarModule,
    EmptyStateComponent
  ],
  templateUrl: './lab-sub-category-list.component.html',
  styleUrl: './lab-sub-category-list.component.scss'
})
export class LabSubCategoryListComponent {
  private readonly categoryService = inject(LabCategoryService);
  private readonly service = inject(LabSubCategoryService);
  private readonly notification = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly categorySearchTerms = new Subject<string>();

  subCategories = signal<LabSubCategory[]>([]);
  loading = signal(false);
  searchTerm = signal('');
  editingId: number | null = null;

  categoryQuery = signal('');
  categoryResults = signal<LabCategory[]>([]);
  selectedCategory = signal<LabCategory | null>(null);

  form: SubCategoryForm = { ...BLANK_FORM };

  filteredSubCategories = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return this.subCategories();
    }
    return this.subCategories().filter(
      (s) => s.name.toLowerCase().includes(term) || s.categoryName.toLowerCase().includes(term)
    );
  });

  pagination = new TablePagination(this.filteredSubCategories);

  constructor() {
    this.refresh();
    this.categorySearchTerms
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => this.categoryService.search(query)),
        takeUntilDestroyed()
      )
      .subscribe((results) => this.categoryResults.set(results));
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.pagination.reset();
  }

  onPageSizeChange(size: number): void {
    this.pagination.pageSize.set(size);
    this.pagination.reset();
  }

  onCategoryQueryChange(value: string): void {
    this.categoryQuery.set(value);
    this.selectedCategory.set(null);
    if (value.trim().length >= 1) {
      this.categorySearchTerms.next(value.trim());
    } else {
      this.categoryResults.set([]);
    }
  }

  selectCategory(category: LabCategory): void {
    this.selectedCategory.set(category);
    this.categoryQuery.set(category.name);
    this.categoryResults.set([]);
  }

  refresh(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (subCategories) => {
        this.subCategories.set(subCategories);
        this.pagination.reset();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load lab sub-categories.');
      }
    });
  }

  get isValid(): boolean {
    return this.selectedCategory() !== null && this.form.name.trim().length > 0;
  }

  submit(): void {
    if (!this.isValid) {
      return;
    }
    const input = {
      categoryId: this.selectedCategory()!.id,
      name: this.form.name.trim(),
      opAmount: this.form.opAmount,
      ipAmount: this.form.ipAmount,
      notes: this.form.notes.trim() || null,
      orderingNo: this.form.orderingNo,
      heading: this.form.heading.trim() || null
    };
    const save$ = this.editingId ? this.service.update(this.editingId, input) : this.service.create(input);
    save$.subscribe({
      next: () => {
        this.notification.success(this.editingId ? 'Sub-category updated.' : 'Sub-category added.');
        this.resetForm();
        this.refresh();
      },
      error: (err) => this.notification.error(err.error?.message ?? 'Failed to save the sub-category.')
    });
  }

  edit(subCategory: LabSubCategory): void {
    this.editingId = subCategory.id;
    this.selectedCategory.set({
      id: subCategory.categoryId,
      name: subCategory.categoryName,
      opAmount: 0,
      ipAmount: 0,
      orderingNo: 0,
      subCategoryCount: 0,
      componentCount: 0
    });
    this.categoryQuery.set(subCategory.categoryName);
    this.form = {
      name: subCategory.name,
      opAmount: subCategory.opAmount,
      ipAmount: subCategory.ipAmount,
      notes: subCategory.notes ?? '',
      orderingNo: subCategory.orderingNo,
      heading: subCategory.heading ?? ''
    };
  }

  cancelEdit(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.editingId = null;
    this.form = { ...BLANK_FORM };
    this.categoryQuery.set('');
    this.selectedCategory.set(null);
    this.categoryResults.set([]);
  }

  remove(subCategory: LabSubCategory): void {
    const childWarning =
      subCategory.componentCount > 0
        ? ` This will also delete its ${subCategory.componentCount} component(s).`
        : '';
    this.confirmDialog
      .confirm({
        title: `Delete ${subCategory.name}?`,
        message: `This cannot be undone.${childWarning}`,
        confirmLabel: 'Delete',
        destructive: true
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.service.delete(subCategory.id).subscribe({
          next: () => {
            this.notification.success('Sub-category deleted.');
            if (this.editingId === subCategory.id) {
              this.resetForm();
            }
            this.refresh();
          },
          error: () => this.notification.error('Failed to delete the sub-category.')
        });
      });
  }
}
