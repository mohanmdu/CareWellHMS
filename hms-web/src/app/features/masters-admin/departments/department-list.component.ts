import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Department } from './department.model';
import { DepartmentService } from './department.service';

/**
 * Reference implementation of the generic master/detail CRUD screen pattern
 * (migration doc §5) that should be generalized into a shared
 * MasterCrudComponent<T> once 2-3 more master entities are ported.
 */
@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './department-list.component.html'
})
export class DepartmentListComponent {
  private readonly service = inject(DepartmentService);

  departments = signal<Department[]>([]);
  newDepartmentName = '';
  errorMessage = signal<string | null>(null);

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.service.list().subscribe({
      next: (departments) => this.departments.set(departments),
      error: () => this.errorMessage.set('Failed to load departments.')
    });
  }

  add(): void {
    if (!this.newDepartmentName.trim()) {
      return;
    }
    this.service.create({ name: this.newDepartmentName.trim() }).subscribe({
      next: () => {
        this.newDepartmentName = '';
        this.refresh();
      },
      error: () => this.errorMessage.set('Failed to create department.')
    });
  }

  deactivate(department: Department): void {
    if (department.id === null) {
      return;
    }
    this.service.deactivate(department.id).subscribe({
      next: () => this.refresh(),
      error: () => this.errorMessage.set('Failed to deactivate department.')
    });
  }
}
