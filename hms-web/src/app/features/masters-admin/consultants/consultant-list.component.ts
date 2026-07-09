import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge/status-badge.component';
import { Department } from '../departments/department.model';
import { DepartmentService } from '../departments/department.service';
import { Consultant } from './consultant.model';
import { ConsultantService } from './consultant.service';

/**
 * Consultants carry more fields than the generic { name, active } master
 * shape (department, specialization, fee, contact details), so this screen
 * is hand-built rather than driven by shared/master-crud - but still shares
 * the page-header/status-badge/table primitives so it reads as the same
 * system as Departments/Roles.
 */
@Component({
  selector: 'app-consultant-list',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    EmptyStateComponent
  ],
  templateUrl: './consultant-list.component.html',
  styleUrl: './consultant-list.component.scss'
})
export class ConsultantListComponent {
  private readonly service = inject(ConsultantService);
  private readonly departmentService = inject(DepartmentService);
  private readonly notification = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly displayedColumns = ['name', 'department', 'specialization', 'fee', 'status', 'actions'];

  consultants = signal<Consultant[]>([]);
  departments = signal<Department[]>([]);
  loading = signal(false);
  saving = signal(false);

  form = {
    name: '',
    departmentId: null as number | null,
    specialization: '',
    email: '',
    mobileNumber: '',
    consultationFee: 0
  };

  constructor() {
    this.refresh();
    this.departmentService.list().subscribe({
      next: (departments) => this.departments.set(departments.filter((d) => d.active)),
      error: () => this.notification.error('Failed to load departments.')
    });
  }

  refresh(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (consultants) => {
        this.consultants.set(consultants);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Failed to load consultants.');
      }
    });
  }

  add(): void {
    if (!this.form.name.trim() || !this.form.departmentId) {
      return;
    }
    this.saving.set(true);
    this.service
      .create({
        name: this.form.name.trim(),
        departmentId: this.form.departmentId,
        specialization: this.form.specialization,
        email: this.form.email,
        mobileNumber: this.form.mobileNumber,
        consultationFee: this.form.consultationFee
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.form = {
            name: '',
            departmentId: null,
            specialization: '',
            email: '',
            mobileNumber: '',
            consultationFee: 0
          };
          this.notification.success('Consultant added.');
          this.refresh();
        },
        error: () => {
          this.saving.set(false);
          this.notification.error('Failed to create consultant.');
        }
      });
  }

  deactivate(consultant: Consultant): void {
    if (consultant.id === null) {
      return;
    }
    this.confirmDialog
      .confirm({
        title: `Deactivate ${consultant.name}?`,
        message: 'This consultant will no longer be available for new appointments.',
        confirmLabel: 'Deactivate',
        destructive: true
      })
      .subscribe((confirmed) => {
        if (!confirmed || consultant.id === null) {
          return;
        }
        this.service.deactivate(consultant.id).subscribe({
          next: () => {
            this.notification.success('Consultant deactivated.');
            this.refresh();
          },
          error: () => this.notification.error('Failed to deactivate consultant.')
        });
      });
  }
}
