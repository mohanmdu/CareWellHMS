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
import { LabCategory, LabComponent as LabComponentModel, LabSubCategory } from './lab.model';
import { LabCategoryService } from './lab-category.service';
import { LabComponentService } from './lab-component.service';
import { LabSubCategoryService } from './lab-sub-category.service';

interface ComponentForm {
  name: string;
  fieldType: string;
  sampleType: string;
  method: string;
  maleRangeFrom: string;
  maleRangeTo: string;
  femaleRangeFrom: string;
  femaleRangeTo: string;
  normalRange: string;
  units: string;
  orderingNo: number;
  componentHeading: string;
  conventionalFactor: string;
  siUnit: string;
}

const BLANK_FORM: ComponentForm = {
  name: '',
  fieldType: '',
  sampleType: '',
  method: '',
  maleRangeFrom: '',
  maleRangeTo: '',
  femaleRangeFrom: '',
  femaleRangeTo: '',
  normalRange: '',
  units: '',
  orderingNo: 0,
  componentHeading: '',
  conventionalFactor: '',
  siUnit: ''
};

/**
 * Lab Component master: leaf of the hierarchy. Category and Sub-Category
 * are both searchable autocompletes; Sub-Category's search is scoped to
 * whichever Category is currently selected, so picking a mismatched pair
 * isn't possible.
 */
@Component({
  selector: 'app-lab-component-list',
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
  templateUrl: './lab-component-list.component.html',
  styleUrl: './lab-component-list.component.scss'
})
export class LabComponentListComponent {
  private readonly categoryService = inject(LabCategoryService);
  private readonly subCategoryService = inject(LabSubCategoryService);
  private readonly service = inject(LabComponentService);
  private readonly notification = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly categorySearchTerms = new Subject<string>();
  private readonly subCategorySearchTerms = new Subject<string>();

  components = signal<LabComponentModel[]>([]);
  loading = signal(false);
  searchTerm = signal('');
  editingId: number | null = null;

  categoryQuery = signal('');
  categoryResults = signal<LabCategory[]>([]);
  selectedCategory = signal<LabCategory | null>(null);

  subCategoryQuery = signal('');
  subCategoryResults = signal<LabSubCategory[]>([]);
  selectedSubCategory = signal<LabSubCategory | null>(null);

  form: ComponentForm = { ...BLANK_FORM };

  filteredComponents = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return this.components();
    }
    return this.components().filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.categoryName.toLowerCase().includes(term) ||
        c.subCategoryName.toLowerCase().includes(term)
    );
  });

  pagination = new TablePagination(this.filteredComponents);

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

    this.subCategorySearchTerms
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => this.subCategoryService.search(query, this.selectedCategory()?.id ?? null)),
        takeUntilDestroyed()
      )
      .subscribe((results) => this.subCategoryResults.set(results));
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
    this.subCategoryQuery.set('');
    this.selectedSubCategory.set(null);
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
    this.subCategoryQuery.set('');
    this.selectedSubCategory.set(null);
  }

  onSubCategoryQueryChange(value: string): void {
    this.subCategoryQuery.set(value);
    this.selectedSubCategory.set(null);
    if (value.trim().length >= 1) {
      this.subCategorySearchTerms.next(value.trim());
    } else {
      this.subCategoryResults.set([]);
    }
  }

  selectSubCategory(subCategory: LabSubCategory): void {
    this.selectedSubCategory.set(subCategory);
    this.subCategoryQuery.set(subCategory.name);
    this.subCategoryResults.set([]);
  }

  refresh(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (components) => {
        this.components.set(components);
        this.pagination.reset();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load lab components.');
      }
    });
  }

  get isValid(): boolean {
    return this.selectedSubCategory() !== null && this.form.name.trim().length > 0;
  }

  submit(): void {
    if (!this.isValid) {
      return;
    }
    const input = {
      subCategoryId: this.selectedSubCategory()!.id,
      name: this.form.name.trim(),
      fieldType: this.form.fieldType.trim() || null,
      sampleType: this.form.sampleType.trim() || null,
      method: this.form.method.trim() || null,
      maleRangeFrom: this.form.maleRangeFrom.trim() || null,
      maleRangeTo: this.form.maleRangeTo.trim() || null,
      femaleRangeFrom: this.form.femaleRangeFrom.trim() || null,
      femaleRangeTo: this.form.femaleRangeTo.trim() || null,
      normalRange: this.form.normalRange.trim() || null,
      units: this.form.units.trim() || null,
      orderingNo: this.form.orderingNo,
      componentHeading: this.form.componentHeading.trim() || null,
      conventionalFactor: this.form.conventionalFactor.trim() || null,
      siUnit: this.form.siUnit.trim() || null
    };
    const save$ = this.editingId ? this.service.update(this.editingId, input) : this.service.create(input);
    save$.subscribe({
      next: () => {
        this.notification.success(this.editingId ? 'Component updated.' : 'Component added.');
        this.resetForm();
        this.refresh();
      },
      error: (err) => this.notification.error(err.error?.message ?? 'Failed to save the component.')
    });
  }

  edit(component: LabComponentModel): void {
    this.editingId = component.id;
    this.selectedCategory.set({
      id: component.categoryId,
      name: component.categoryName,
      opAmount: 0,
      ipAmount: 0,
      orderingNo: 0,
      revenueBucket: 'LAB',
      subCategoryCount: 0,
      componentCount: 0
    });
    this.categoryQuery.set(component.categoryName);
    this.selectedSubCategory.set({
      id: component.subCategoryId,
      categoryId: component.categoryId,
      categoryName: component.categoryName,
      name: component.subCategoryName,
      opAmount: 0,
      ipAmount: 0,
      notes: null,
      orderingNo: 0,
      heading: null,
      componentCount: 0
    });
    this.subCategoryQuery.set(component.subCategoryName);
    this.form = {
      name: component.name,
      fieldType: component.fieldType ?? '',
      sampleType: component.sampleType ?? '',
      method: component.method ?? '',
      maleRangeFrom: component.maleRangeFrom ?? '',
      maleRangeTo: component.maleRangeTo ?? '',
      femaleRangeFrom: component.femaleRangeFrom ?? '',
      femaleRangeTo: component.femaleRangeTo ?? '',
      normalRange: component.normalRange ?? '',
      units: component.units ?? '',
      orderingNo: component.orderingNo,
      componentHeading: component.componentHeading ?? '',
      conventionalFactor: component.conventionalFactor ?? '',
      siUnit: component.siUnit ?? ''
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
    this.subCategoryQuery.set('');
    this.selectedSubCategory.set(null);
    this.subCategoryResults.set([]);
  }

  remove(component: LabComponentModel): void {
    this.confirmDialog
      .confirm({
        title: `Delete ${component.name}?`,
        message: 'This cannot be undone.',
        confirmLabel: 'Delete',
        destructive: true
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.service.delete(component.id).subscribe({
          next: () => {
            this.notification.success('Component deleted.');
            if (this.editingId === component.id) {
              this.resetForm();
            }
            this.refresh();
          },
          error: () => this.notification.error('Failed to delete the component.')
        });
      });
  }
}
