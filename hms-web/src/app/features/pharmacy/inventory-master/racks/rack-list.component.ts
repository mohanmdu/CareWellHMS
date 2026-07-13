import { Component, inject } from '@angular/core';
import { MasterCrudComponent } from '../../../../shared/master-crud/master-crud.component';
import { MasterCrudConfig } from '../../../../shared/master-crud/master-crud.model';
import { Rack } from './rack.model';
import { RackService } from './rack.service';

@Component({
  selector: 'app-rack-list',
  standalone: true,
  imports: [MasterCrudComponent],
  templateUrl: './rack-list.component.html'
})
export class RackListComponent {
  private readonly service = inject(RackService);

  readonly config: MasterCrudConfig<Rack> = {
    title: 'Rack Master',
    subtitle: 'Storage rack/location codes used by the Product master.',
    entityLabel: 'rack',
    getId: (rack) => rack.id,
    getName: (rack) => rack.name,
    getActive: (rack) => rack.active,
    list: () => this.service.list(),
    listInactive: () => this.service.listInactive(),
    create: (name) => this.service.create(name),
    update: (id, name) => this.service.update(id, name),
    deactivate: (id) => this.service.deactivate(id),
    restore: (id) => this.service.restore(id),
    activeTabLabel: 'Activate',
    inactiveTabLabel: 'DeActivated'
  };
}
