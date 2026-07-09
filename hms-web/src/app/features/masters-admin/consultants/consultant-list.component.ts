import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Department } from '../departments/department.model';
import { DepartmentService } from '../departments/department.service';
import { Consultant } from './consultant.model';
import { ConsultantService } from './consultant.service';

@Component({
  selector: 'app-consultant-list',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './consultant-list.component.html'
})
export class ConsultantListComponent {
  private readonly service = inject(ConsultantService);
  private readonly departmentService = inject(DepartmentService);

  consultants = signal<Consultant[]>([]);
  departments = signal<Department[]>([]);
  errorMessage = signal<string | null>(null);

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
      error: () => this.errorMessage.set('Failed to load departments.')
    });
  }

  refresh(): void {
    this.service.list().subscribe({
      next: (consultants) => this.consultants.set(consultants),
      error: () => this.errorMessage.set('Failed to load consultants.')
    });
  }

  add(): void {
    if (!this.form.name.trim() || !this.form.departmentId) {
      return;
    }
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
          this.form = { name: '', departmentId: null, specialization: '', email: '', mobileNumber: '', consultationFee: 0 };
          this.refresh();
        },
        error: () => this.errorMessage.set('Failed to create consultant.')
      });
  }

  deactivate(consultant: Consultant): void {
    if (consultant.id === null) {
      return;
    }
    this.service.deactivate(consultant.id).subscribe({
      next: () => this.refresh(),
      error: () => this.errorMessage.set('Failed to deactivate consultant.')
    });
  }
}
