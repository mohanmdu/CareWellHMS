import { Component, inject } from '@angular/core';
import { MasterCrudComponent } from '../../../shared/master-crud/master-crud.component';
import { MasterCrudConfig } from '../../../shared/master-crud/master-crud.model';
import { Specialization } from './specialization.model';
import { SpecializationService } from './specialization.service';

@Component({
  selector: 'app-specialization-list',
  standalone: true,
  imports: [MasterCrudComponent],
  templateUrl: './specialization-list.component.html'
})
export class SpecializationListComponent {
  private readonly service = inject(SpecializationService);

  readonly config: MasterCrudConfig<Specialization> = {
    title: 'Specializations',
    subtitle: 'Predefined specialization list used on the Consultants form.',
    entityLabel: 'specialization',
    getId: (specialization) => specialization.id,
    getName: (specialization) => specialization.name,
    getActive: (specialization) => specialization.active,
    list: () => this.service.list(),
    create: (name) => this.service.create({ name }),
    deactivate: (id) => this.service.deactivate(id)
  };
}
