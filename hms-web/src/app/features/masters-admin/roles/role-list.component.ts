import { Component, inject } from '@angular/core';
import { MasterCrudComponent } from '../../../shared/master-crud/master-crud.component';
import { MasterCrudConfig } from '../../../shared/master-crud/master-crud.model';
import { Role } from './role.model';
import { RoleService } from './role.service';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [MasterCrudComponent],
  templateUrl: './role-list.component.html'
})
export class RoleListComponent {
  private readonly service = inject(RoleService);

  readonly config: MasterCrudConfig<Role> = {
    title: 'Roles',
    subtitle: 'System roles used for staff permissions and access control.',
    entityLabel: 'role',
    getId: (role) => role.id,
    getName: (role) => role.name,
    getActive: (role) => role.active,
    list: () => this.service.list(),
    create: (name) => this.service.create({ name }),
    deactivate: (id) => this.service.deactivate(id)
  };
}
