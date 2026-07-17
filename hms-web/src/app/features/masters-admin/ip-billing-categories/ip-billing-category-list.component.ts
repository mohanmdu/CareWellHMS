import { Component, inject } from '@angular/core';
import { MasterCrudComponent } from '../../../shared/master-crud/master-crud.component';
import { MasterCrudConfig } from '../../../shared/master-crud/master-crud.model';
import { IpBillingCategory } from './ip-billing-category.model';
import { IpBillingCategoryService } from './ip-billing-category.service';

@Component({
  selector: 'app-ip-billing-category-list',
  standalone: true,
  imports: [MasterCrudComponent],
  templateUrl: './ip-billing-category-list.component.html'
})
export class IpBillingCategoryListComponent {
  private readonly service = inject(IpBillingCategoryService);

  readonly config: MasterCrudConfig<IpBillingCategory> = {
    title: 'IP Billing Categories',
    subtitle: 'Categories that group IP Billing components (e.g. ICU Charges, Baby Care).',
    entityLabel: 'category',
    getId: (category) => category.id,
    getName: (category) => category.name,
    getActive: (category) => category.active,
    list: () => this.service.list(),
    listInactive: () => this.service.listInactive(),
    create: (name) => this.service.create(name),
    update: (id, name) => this.service.update(id, name),
    deactivate: (id) => this.service.deactivate(id),
    restore: (id) => this.service.restore(id)
  };
}
