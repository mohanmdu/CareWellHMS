import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/reports-mis/dashboard/dashboard.component').then((m) => m.DashboardComponent)
  },
  {
    path: 'masters/departments',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/masters-admin/departments/department-list.component').then(
        (m) => m.DepartmentListComponent
      )
  },
  {
    path: 'masters/roles',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/masters-admin/roles/role-list.component').then((m) => m.RoleListComponent)
  },
  {
    path: 'masters/consultants',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/masters-admin/consultants/consultant-list.component').then(
        (m) => m.ConsultantListComponent
      )
  },
  {
    path: 'appointments/book',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/appointments/booking/booking-wizard.component').then((m) => m.BookingWizardComponent)
  },
  {
    path: 'appointments',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/appointments/booking/appointment-list.component').then(
        (m) => m.AppointmentListComponent
      )
  },
  {
    path: 'billing/catalog',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/billing-receipts/items/billing-catalog.component').then((m) => m.BillingCatalogComponent)
  },
  {
    path: 'billing/invoices/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/billing-receipts/invoices/invoice-create.component').then(
        (m) => m.InvoiceCreateComponent
      )
  },
  {
    path: 'billing/invoices',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/billing-receipts/invoices/invoice-list.component').then((m) => m.InvoiceListComponent)
  },
  {
    path: 'lab/requisitions/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/lab-radiology/requisitions/requisition-create.component').then(
        (m) => m.RequisitionCreateComponent
      )
  },
  {
    path: 'lab/requisitions',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/lab-radiology/requisitions/requisition-worklist.component').then(
        (m) => m.RequisitionWorklistComponent
      )
  },
  {
    path: 'pharmacy/drugs',
    canActivate: [authGuard],
    loadComponent: () => import('./features/pharmacy/drugs/drug-list.component').then((m) => m.DrugListComponent)
  },
  {
    path: 'pharmacy/stock',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/pharmacy/batches/drug-batch-list.component').then((m) => m.DrugBatchListComponent)
  },
  {
    path: 'pharmacy/dispense',
    canActivate: [authGuard],
    loadComponent: () => import('./features/pharmacy/sales/sale-create.component').then((m) => m.SaleCreateComponent)
  },
  {
    path: 'pharmacy/sales',
    canActivate: [authGuard],
    loadComponent: () => import('./features/pharmacy/sales/sale-list.component').then((m) => m.SaleListComponent)
  },
  {
    path: 'ip/rooms',
    canActivate: [authGuard],
    loadComponent: () => import('./features/ip-admission/rooms/room-catalog.component').then((m) => m.RoomCatalogComponent)
  },
  {
    path: 'ip/admissions',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/ip-admission/admissions/admission-worklist.component').then(
        (m) => m.AdmissionWorklistComponent
      )
  },
  {
    path: 'insurance/claims',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/insurance/claims/insurance-claim-worklist.component').then(
        (m) => m.InsuranceClaimWorklistComponent
      )
  }
  // All Phase 2 modules from the migration plan (§7) now have a working
  // vertical slice: Masters, Appointments, OP Billing, Lab, Pharmacy,
  // IP Admission, Insurance, and this MIS Dashboard.
];
