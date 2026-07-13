import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { TablePagination } from '../../../shared/table/table-pagination';
import { TableSearchComponent } from '../../../shared/table/table-search.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { Department } from './department.model';
import { DepartmentService } from './department.service';

/**
 * Departments: one screen, two tabs (Active / Inactive), mirroring Patient
 * Registration. Hand-built rather than driven by shared/master-crud because
 * this screen needs created/deactivated attribution and a consultant count
 * (which links into the Consultants screen filtered to that department) -
 * fields the generic { name, active } master shape doesn't carry.
 */
@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    MatTabsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatPaginatorModule,
    PageHeaderComponent,
    EmptyStateComponent,
    TableSearchComponent
  ],
  templateUrl: './department-list.component.html',
  styleUrl: './department-list.component.scss'
})
export class DepartmentListComponent {
  private readonly service = inject(DepartmentService);
  private readonly notification = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly router = inject(Router);

  readonly activeColumns = ['name', 'createdAt', 'createdBy', 'consultants', 'actions'];
  readonly inactiveColumns = ['name', 'deactivatedAt', 'deactivatedBy', 'consultants', 'actions'];

  activeDepartments = signal<Department[]>([]);
  inactiveDepartments = signal<Department[]>([]);
  loadingActive = signal(false);
  loadingInactive = signal(false);
  saving = signal(false);

  newName = '';

  searchTerm = signal('');
  filteredActiveDepartments = computed(() => this.filterByName(this.activeDepartments()));
  filteredInactiveDepartments = computed(() => this.filterByName(this.inactiveDepartments()));
  activePagination = new TablePagination(this.filteredActiveDepartments);
  inactivePagination = new TablePagination(this.filteredInactiveDepartments);

  constructor() {
    this.refreshActive();
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
    this.activePagination.reset();
    this.inactivePagination.reset();
  }

  private filterByName(departments: Department[]): Department[] {
    const term = this.searchTerm().trim().toLowerCase();
    return term ? departments.filter((d) => d.name.toLowerCase().includes(term)) : departments;
  }

  refreshActive(): void {
    this.loadingActive.set(true);
    this.service.list().subscribe({
      next: (departments) => {
        this.activeDepartments.set(departments);
        this.activePagination.reset();
        this.loadingActive.set(false);
      },
      error: () => {
        this.loadingActive.set(false);
        this.notification.error('Failed to load departments.');
      }
    });
  }

  refreshInactive(): void {
    this.loadingInactive.set(true);
    this.service.listInactive().subscribe({
      next: (departments) => {
        this.inactiveDepartments.set(departments);
        this.inactivePagination.reset();
        this.loadingInactive.set(false);
      },
      error: () => {
        this.loadingInactive.set(false);
        this.notification.error('Failed to load inactive departments.');
      }
    });
  }

  onTabChange(index: number): void {
    if (index === 1) {
      this.refreshInactive();
    }
  }

  add(): void {
    if (!this.newName.trim()) {
      return;
    }
    this.saving.set(true);
    this.service.create({ name: this.newName.trim() }).subscribe({
      next: () => {
        this.saving.set(false);
        this.newName = '';
        this.notification.success('Department added.');
        this.refreshActive();
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err.error?.message ?? 'Failed to create department.');
      }
    });
  }

  deactivate(department: Department): void {
    if (department.id === null) {
      return;
    }
    this.confirmDialog
      .confirm({
        title: `Deactivate ${department.name}?`,
        message: 'The department will be moved to Inactive Departments and can be restored later.',
        confirmLabel: 'Deactivate',
        destructive: true
      })
      .subscribe((confirmed) => {
        if (!confirmed || department.id === null) {
          return;
        }
        this.service.deactivate(department.id).subscribe({
          next: () => {
            this.notification.success('Department deactivated.');
            this.refreshActive();
            this.refreshInactive();
          },
          error: () => this.notification.error('Failed to deactivate department.')
        });
      });
  }

  restore(department: Department): void {
    if (department.id === null) {
      return;
    }
    this.service.restore(department.id).subscribe({
      next: () => {
        this.notification.success('Department restored.');
        this.refreshActive();
        this.refreshInactive();
      },
      error: () => this.notification.error('Failed to restore department.')
    });
  }

  viewConsultants(department: Department): void {
    this.router.navigate(['/masters/consultants'], { queryParams: { departmentId: department.id } });
  }
}
