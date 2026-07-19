import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { Department } from '../../departments/department.model';
import { DepartmentService } from '../../departments/department.service';
import { ConfirmDialogService } from '../../../../shared/services/confirm-dialog.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';
import { CmsCareerOpening, CmsCareerOpeningInput } from './cms-career-opening.model';
import { CmsCareerOpeningService } from './cms-career-opening.service';

const EMPTY_FORM: CmsCareerOpeningInput = { title: '', departmentId: null, description: '', applyEmail: '' };

/**
 * Website Career Openings: inline Title/Department/Description/Apply Email
 * Add/Update/Clear form (Department is optional, sourced from the existing
 * DepartmentService), Active/Deactivated tables.
 */
@Component({
  selector: 'app-cms-career-opening-list',
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
  templateUrl: './cms-career-opening-list.component.html',
  styleUrl: './cms-career-opening-list.component.scss'
})
export class CmsCareerOpeningListComponent {
  private readonly service = inject(CmsCareerOpeningService);
  private readonly departmentService = inject(DepartmentService);
  private readonly notification = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly activeColumns = ['title', 'departmentName', 'applyEmail', 'actions'];
  readonly inactiveColumns = ['title', 'departmentName', 'applyEmail', 'actions'];

  departments = signal<Department[]>([]);
  activeItems = signal<CmsCareerOpening[]>([]);
  inactiveItems = signal<CmsCareerOpening[]>([]);
  loadingActive = signal(false);
  loadingInactive = signal(false);
  saving = signal(false);

  editingId = signal<number | null>(null);
  form: CmsCareerOpeningInput = { ...EMPTY_FORM };

  constructor() {
    this.departmentService.list().subscribe((departments) => this.departments.set(departments));
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
        this.notification.error('Failed to load career openings.');
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
        this.notification.error('Failed to load deactivated career openings.');
      }
    });
  }

  edit(item: CmsCareerOpening): void {
    if (item.id === null) {
      return;
    }
    this.editingId.set(item.id);
    this.form = {
      title: item.title,
      departmentId: item.departmentId,
      description: item.description,
      applyEmail: item.applyEmail
    };
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
        this.notification.success(id !== null ? 'Career opening updated.' : 'Career opening added.');
        this.clear();
        this.refreshActive();
      },
      error: (err) => {
        this.saving.set(false);
        this.notification.error(err.error?.message ?? 'Failed to save career opening.');
      }
    });
  }

  deactivate(item: CmsCareerOpening): void {
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
            this.notification.success('Career opening deactivated.');
            this.refreshActive();
            this.refreshInactive();
          },
          error: (err) => this.notification.error(err.error?.message ?? 'Failed to deactivate career opening.')
        });
      });
  }

  restore(item: CmsCareerOpening): void {
    if (item.id === null) {
      return;
    }
    this.service.restore(item.id).subscribe({
      next: () => {
        this.notification.success('Career opening restored.');
        this.refreshActive();
        this.refreshInactive();
      },
      error: () => this.notification.error('Failed to restore career opening.')
    });
  }
}
