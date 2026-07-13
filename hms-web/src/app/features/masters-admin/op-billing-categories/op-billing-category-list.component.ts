import { Component, inject } from '@angular/core';
import { MasterCrudComponent } from '../../../shared/master-crud/master-crud.component';
import { MasterCrudConfig } from '../../../shared/master-crud/master-crud.model';
import { OpBillingCategory } from './op-billing-category.model';
import { OpBillingCategoryService } from './op-billing-category.service';

@Component({
  selector: 'app-op-billing-category-list',
  standalone: true,
  imports: [MasterCrudComponent],
  templateUrl: './op-billing-category-list.component.html'
})
export class OpBillingCategoryListComponent {
  private readonly service = inject(OpBillingCategoryService);

  readonly config: MasterCrudConfig<OpBillingCategory> = {
    title: 'OP Billing Categories',
    subtitle: 'Categories that group OP Direct Billing components (e.g. Registration, Lab Charge).',
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
