import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { ConfirmDialogService } from '../services/confirm-dialog.service';
import { NotificationService } from '../services/notification.service';
import { TablePagination } from '../table/table-pagination';
import { TableSearchComponent } from '../table/table-search.component';
import { EmptyStateComponent } from '../ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../ui/page-header/page-header.component';
import { StatusBadgeComponent } from '../ui/status-badge/status-badge.component';
import { MasterCrudConfig } from './master-crud.model';

/**
 * Generic master/detail CRUD screen (list + inline add + deactivate) for any
 * entity shaped like { id, name, active }. Configured per entity via
 * `[config]`; see DepartmentListComponent / RoleListComponent.
 */
@Component({
  selector: 'app-master-crud',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatTabsModule,
    PageHeaderComponent,
    EmptyStateComponent,
    StatusBadgeComponent,
    TableSearchComponent
  ],
  templateUrl: './master-crud.component.html',
  styleUrl: './master-crud.component.scss'
})
export class MasterCrudComponent<T> implements OnInit {
  private readonly notification = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  config = input.required<MasterCrudConfig<T>>();
  /** Renders as a panel (no outer page wrapper/H1) for composition inside a larger page - e.g. Billing Catalog's two-column layout. */
  embedded = input(false);

  readonly displayedColumns = ['name', 'status', 'actions'];
  items = signal<T[]>([]);
  loading = signal(false);
  saving = signal(false);
  newName = '';

  /** Active/Inactive tabs + Edit/Restore only render when the config opts in - see MasterCrudConfig's doc comment. */
  readonly tabbed = computed(() => {
    const cfg = this.config();
    return !!(cfg.listInactive && cfg.update && cfg.restore);
  });

  searchTerm = signal('');
  filteredItems = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return this.items();
    }
    const cfg = this.config();
    return this.items().filter((item) => cfg.getName(item).toLowerCase().includes(term));
  });
  pagination = new TablePagination(this.filteredItems);

  inactiveItems = signal<T[]>([]);
  loadingInactive = signal(false);
  inactiveSearchTerm = signal('');
  filteredInactiveItems = computed(() => {
    const term = this.inactiveSearchTerm().trim().toLowerCase();
    if (!term) {
      return this.inactiveItems();
    }
    const cfg = this.config();
    return this.inactiveItems().filter((item) => cfg.getName(item).toLowerCase().includes(term));
  });
  inactivePagination = new TablePagination(this.filteredInactiveItems);

  editingId = signal<number | null>(null);
  editingName = '';

  ngOnInit(): void {
    this.refresh();
  }

  onTabChange(index: number): void {
    if (index === 1) {
      this.refreshInactive();
    }
  }

  onInactiveSearch(term: string): void {
    this.inactiveSearchTerm.set(term);
    this.inactivePagination.reset();
  }

  refreshInactive(): void {
    const listInactive = this.config().listInactive;
    if (!listInactive) {
      return;
    }
    this.loadingInactive.set(true);
    listInactive().subscribe({
      next: (items) => {
        this.inactiveItems.set(items);
        this.inactivePagination.reset();
        this.loadingInactive.set(false);
      },
      error: () => {
        this.loadingInactive.set(false);
        this.notification.error(`Failed to load inactive ${this.config().entityLabel}s.`);
      }
    });
  }

  startEdit(item: T): void {
    const cfg = this.config();
    this.editingId.set(cfg.getId(item));
    this.editingName = cfg.getName(item);
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.editingName = '';
  }

  saveEdit(item: T): void {
    const cfg = this.config();
    const id = cfg.getId(item);
    const name = this.editingName.trim();
    if (id === null || !name || !cfg.update) {
      return;
    }
    cfg.update(id, name).subscribe({
      next: () => {
        this.notification.success(`${this.capitalize(cfg.entityLabel)} updated.`);
        this.cancelEdit();
        this.refresh();
      },
      error: () => this.notification.error(`Failed to update ${cfg.entityLabel}.`)
    });
  }

  restore(item: T): void {
    const cfg = this.config();
    const id = cfg.getId(item);
    if (id === null || !cfg.restore) {
      return;
    }
    cfg.restore(id).subscribe({
      next: () => {
        this.notification.success(`${this.capitalize(cfg.entityLabel)} restored.`);
        this.refresh();
        this.refreshInactive();
      },
      error: () => this.notification.error(`Failed to restore ${cfg.entityLabel}.`)
    });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.pagination.reset();
  }

  refresh(): void {
    this.loading.set(true);
    this.config()
      .list()
      .subscribe({
        next: (items) => {
          this.items.set(items);
          this.pagination.reset();
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.notification.error(`Failed to load ${this.config().entityLabel}s.`);
        }
      });
  }

  add(): void {
    const name = this.newName.trim();
    if (!name) {
      return;
    }
    this.saving.set(true);
    this.config()
      .create(name)
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.newName = '';
          this.notification.success(`${this.capitalize(this.config().entityLabel)} added.`);
          this.refresh();
        },
        error: () => {
          this.saving.set(false);
          this.notification.error(`Failed to create ${this.config().entityLabel}.`);
        }
      });
  }

  deactivate(item: T): void {
    const cfg = this.config();
    const id = cfg.getId(item);
    if (id === null) {
      return;
    }
    this.confirmDialog
      .confirm({
        title: `Deactivate ${cfg.getName(item)}?`,
        message: `This ${cfg.entityLabel} will no longer be selectable elsewhere in the system. This can be reversed later by an administrator.`,
        confirmLabel: 'Deactivate',
        destructive: true
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        cfg.deactivate(id).subscribe({
          next: () => {
            this.notification.success(`${this.capitalize(cfg.entityLabel)} deactivated.`);
            this.refresh();
          },
          error: () => this.notification.error(`Failed to deactivate ${cfg.entityLabel}.`)
        });
      });
  }

  private capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
