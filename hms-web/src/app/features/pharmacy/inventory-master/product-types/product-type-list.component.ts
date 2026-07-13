import { Component, inject } from '@angular/core';
import { MasterCrudComponent } from '../../../../shared/master-crud/master-crud.component';
import { MasterCrudConfig } from '../../../../shared/master-crud/master-crud.model';
import { ProductType } from './product-type.model';
import { ProductTypeService } from './product-type.service';

@Component({
  selector: 'app-product-type-list',
  standalone: true,
  imports: [MasterCrudComponent],
  templateUrl: './product-type-list.component.html'
})
export class ProductTypeListComponent {
  private readonly service = inject(ProductTypeService);

  readonly config: MasterCrudConfig<ProductType> = {
    title: 'Product Type',
    subtitle: 'Product classifications (e.g. Tablet, Syringe) used by the Product master.',
    entityLabel: 'product type',
    getId: (productType) => productType.id,
    getName: (productType) => productType.name,
    getActive: (productType) => productType.active,
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
