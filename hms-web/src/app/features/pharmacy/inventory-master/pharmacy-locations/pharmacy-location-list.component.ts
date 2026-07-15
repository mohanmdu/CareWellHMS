import { Component, inject } from '@angular/core';
import { MasterCrudComponent } from '../../../../shared/master-crud/master-crud.component';
import { MasterCrudConfig } from '../../../../shared/master-crud/master-crud.model';
import { PharmacyLocation } from '../../pharmacy-billing/pharmacy-location.model';
import { PharmacyLocationService } from '../../pharmacy-billing/pharmacy-location.service';

@Component({
  selector: 'app-pharmacy-location-list',
  standalone: true,
  imports: [MasterCrudComponent],
  templateUrl: './pharmacy-location-list.component.html'
})
export class PharmacyLocationListComponent {
  private readonly service = inject(PharmacyLocationService);

  readonly config: MasterCrudConfig<PharmacyLocation> = {
    title: 'Pharmacy Locations',
    subtitle: 'Dispensing/billing locations used by Pharmacy Billing (e.g. ER, IP, Major OT, Minor OT, Pharmacy).',
    entityLabel: 'location',
    getId: (location) => location.id,
    getName: (location) => location.name,
    getActive: (location) => location.active,
    list: () => this.service.list(),
    listInactive: () => this.service.listInactive(),
    create: (name) => this.service.create(name),
    update: (id, name) => this.service.update(id, name),
    deactivate: (id) => this.service.deactivate(id),
    restore: (id) => this.service.restore(id)
  };
}
