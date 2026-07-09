import { Component, inject } from '@angular/core';
import { MasterCrudComponent } from '../../../shared/master-crud/master-crud.component';
import { MasterCrudConfig } from '../../../shared/master-crud/master-crud.model';
import { Department } from './department.model';
import { DepartmentService } from './department.service';

/**
 * Thin per-entity configuration of the shared MasterCrudComponent<T>
 * (migration doc §5) - the generic list/add/deactivate screen originally
 * prototyped here now lives in shared/master-crud.
 */
@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [MasterCrudComponent],
  templateUrl: './department-list.component.html'
})
export class DepartmentListComponent {
  private readonly service = inject(DepartmentService);

  readonly config: MasterCrudConfig<Department> = {
    title: 'Departments',
    subtitle: 'Clinical and administrative departments used across scheduling, billing and staffing.',
    entityLabel: 'department',
    getId: (department) => department.id,
    getName: (department) => department.name,
    getActive: (department) => department.active,
    list: () => this.service.list(),
    create: (name) => this.service.create({ name }),
    deactivate: (id) => this.service.deactivate(id)
  };
}
