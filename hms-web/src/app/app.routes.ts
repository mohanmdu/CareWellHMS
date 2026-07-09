import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AppShellComponent } from './layout/app-shell/app-shell.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'registration/patients',
        loadComponent: () =>
          import('./features/registration/patients/patient-registration.component').then(
            (m) => m.PatientRegistrationComponent
          )
      },
      {
        path: 'registration/patients/logs',
        loadComponent: () =>
          import('./features/registration/patients/patient-logs.component').then((m) => m.PatientLogsComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/reports-mis/dashboard/dashboard.component').then((m) => m.DashboardComponent)
      },
      {
        path: 'masters/departments',
        loadComponent: () =>
          import('./features/masters-admin/departments/department-list.component').then(
            (m) => m.DepartmentListComponent
          )
      },
      {
        path: 'masters/roles',
        loadComponent: () =>
          import('./features/masters-admin/roles/role-list.component').then((m) => m.RoleListComponent)
      },
      {
        path: 'masters/consultants',
        loadComponent: () =>
          import('./features/masters-admin/consultants/consultant-list.component').then(
            (m) => m.ConsultantListComponent
          )
      },
      {
        path: 'appointments/book',
        loadComponent: () =>
          import('./features/appointments/booking/booking-wizard.component').then((m) => m.BookingWizardComponent)
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./features/appointments/booking/appointment-list.component').then(
            (m) => m.AppointmentListComponent
          )
      },
      {
        path: 'billing/catalog',
        loadComponent: () =>
          import('./features/billing-receipts/items/billing-catalog.component').then(
            (m) => m.BillingCatalogComponent
          )
      },
      {
        path: 'billing/invoices/new',
        loadComponent: () =>
          import('./features/billing-receipts/invoices/invoice-create.component').then(
            (m) => m.InvoiceCreateComponent
          )
      },
      {
        path: 'billing/invoices',
        loadComponent: () =>
          import('./features/billing-receipts/invoices/invoice-list.component').then((m) => m.InvoiceListComponent)
      },
      {
        path: 'lab/requisitions/new',
        loadComponent: () =>
          import('./features/lab-radiology/requisitions/requisition-create.component').then(
            (m) => m.RequisitionCreateComponent
          )
      },
      {
        path: 'lab/requisitions',
        loadComponent: () =>
          import('./features/lab-radiology/requisitions/requisition-worklist.component').then(
            (m) => m.RequisitionWorklistComponent
          )
      },
      {
        path: 'pharmacy/drugs',
        loadComponent: () => import('./features/pharmacy/drugs/drug-list.component').then((m) => m.DrugListComponent)
      },
      {
        path: 'pharmacy/stock',
        loadComponent: () =>
          import('./features/pharmacy/batches/drug-batch-list.component').then((m) => m.DrugBatchListComponent)
      },
      {
        path: 'pharmacy/dispense',
        loadComponent: () =>
          import('./features/pharmacy/sales/sale-create.component').then((m) => m.SaleCreateComponent)
      },
      {
        path: 'pharmacy/sales',
        loadComponent: () => import('./features/pharmacy/sales/sale-list.component').then((m) => m.SaleListComponent)
      },
      {
        path: 'ip/rooms',
        loadComponent: () =>
          import('./features/ip-admission/rooms/room-catalog.component').then((m) => m.RoomCatalogComponent)
      },
      {
        path: 'ip/admissions',
        loadComponent: () =>
          import('./features/ip-admission/admissions/admission-worklist.component').then(
            (m) => m.AdmissionWorklistComponent
          )
      },
      {
        path: 'insurance/claims',
        loadComponent: () =>
          import('./features/insurance/claims/insurance-claim-worklist.component').then(
            (m) => m.InsuranceClaimWorklistComponent
          )
      }
      // All Phase 2 modules from the migration plan (§7) now have a working
      // vertical slice: Masters, Appointments, OP Billing, Lab, Pharmacy,
      // IP Admission, Insurance, and this MIS Dashboard.
    ]
  }
];
