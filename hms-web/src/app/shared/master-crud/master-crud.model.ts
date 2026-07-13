import { Observable } from 'rxjs';

/**
 * Configuration contract for <app-master-crud>. Any "simple master" entity
 * shaped like { id, name, active } (Department, Role, and similar lookup
 * tables) can be ported to the shared list/add/deactivate screen just by
 * providing one of these - see DepartmentListComponent / RoleListComponent
 * for the reference wiring (migration doc §5/§6.1, "MasterCrudComponent<T>").
 */
export interface MasterCrudConfig<T> {
  title: string;
  subtitle?: string;
  entityLabel: string;
  namePlaceholder?: string;
  getId: (item: T) => number | null;
  getName: (item: T) => string;
  getActive: (item: T) => boolean;
  list: () => Observable<T[]>;
  create: (name: string) => Observable<T>;
  deactivate: (id: number) => Observable<void>;
  /**
   * Optional - when all three of listInactive/update/restore are provided,
   * the screen gains an Active/Inactive tab split (lazy-loading the inactive
   * tab, same as the app's other tabbed masters) plus inline Edit and
   * Restore actions. Omitting them preserves today's single-list,
   * deactivate-only behavior for existing consumers (Department,
   * Specialization, Role).
   */
  listInactive?: () => Observable<T[]>;
  update?: (id: number, name: string) => Observable<T>;
  restore?: (id: number) => Observable<void>;
  /** Overrides the tabbed view's tab labels (default 'Active'/'Inactive') - e.g. Pharmacy's masters use 'Activate'/'DeActivated'. */
  activeTabLabel?: string;
  inactiveTabLabel?: string;
}
