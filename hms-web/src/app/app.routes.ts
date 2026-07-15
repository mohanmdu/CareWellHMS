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
        path: 'registration/patients/history',
        loadComponent: () =>
          import('./features/registration/patient-history/patient-past-history.component').then(
            (m) => m.PatientPastHistoryComponent
          )
      },
      {
        path: 'registration/patients/review-date-report',
        loadComponent: () =>
          import('./features/registration/review-date-report/review-date-report.component').then(
            (m) => m.ReviewDateReportComponent
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
        path: 'masters/specializations',
        loadComponent: () =>
          import('./features/masters-admin/specializations/specialization-list.component').then(
            (m) => m.SpecializationListComponent
          )
      },
      {
        path: 'masters/general-users',
        loadComponent: () =>
          import('./features/masters-admin/general-users/general-user-list.component').then(
            (m) => m.GeneralUserListComponent
          )
      },
      {
        path: 'masters/general-users/logs',
        loadComponent: () =>
          import('./features/masters-admin/general-users/general-user-logs.component').then(
            (m) => m.GeneralUserLogsComponent
          )
      },
      {
        path: 'masters/clinic-settings',
        loadComponent: () =>
          import('./features/masters-admin/clinic-settings/clinic-settings-list.component').then(
            (m) => m.ClinicSettingsListComponent
          )
      },
      {
        path: 'masters/op-billing-categories',
        loadComponent: () =>
          import('./features/masters-admin/op-billing-categories/op-billing-category-list.component').then(
            (m) => m.OpBillingCategoryListComponent
          )
      },
      {
        path: 'masters/op-billing-components',
        loadComponent: () =>
          import('./features/masters-admin/op-billing-components/op-billing-component-list.component').then(
            (m) => m.OpBillingComponentListComponent
          )
      },
      {
        path: 'appointments/book',
        loadComponent: () =>
          import('./features/appointments/booking/booking-wizard.component').then((m) => m.BookingWizardComponent)
      },
      {
        path: 'appointments/direct-billing',
        loadComponent: () =>
          import('./features/direct-billing/op-direct-billing.component').then((m) => m.OpDirectBillingComponent)
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./features/appointments/booking/appointment-list.component').then(
            (m) => m.AppointmentListComponent
          )
      },
      {
        path: 'appointments/reports/collection',
        loadComponent: () =>
          import('./features/appointments/reports/collection-report.component').then(
            (m) => m.CollectionReportComponent
          )
      },
      {
        path: 'appointments/refunds',
        loadComponent: () => import('./features/appointments/refunds/refund.component').then((m) => m.RefundComponent)
      },
      {
        path: 'appointments/prescriptions',
        loadComponent: () =>
          import('./features/appointments/prescriptions/patient-prescription.component').then(
            (m) => m.PatientPrescriptionComponent
          )
      },
      {
        path: 'appointments/audit-logs',
        loadComponent: () =>
          import('./features/appointments/audit-logs/appointment-audit-log.component').then(
            (m) => m.AppointmentAuditLogComponent
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
        path: 'pharmacy/inventory-master',
        loadComponent: () =>
          import('./features/pharmacy/inventory-master/inventory-master.component').then(
            (m) => m.InventoryMasterComponent
          )
      },
      {
        path: 'pharmacy/purchase-management',
        loadComponent: () =>
          import('./features/pharmacy/purchase-management/purchase-management.component').then(
            (m) => m.PurchaseManagementComponent
          )
      },
      {
        path: 'pharmacy/billing',
        loadComponent: () =>
          import('./features/pharmacy/pharmacy-billing/pharmacy-billing.component').then(
            (m) => m.PharmacyBillingComponent
          )
      },
      {
        path: 'pharmacy/reports',
        loadComponent: () =>
          import('./features/pharmacy/pharmacy-reports/pharmacy-reports.component').then(
            (m) => m.PharmacyReportsComponent
          )
      },
      {
        path: 'pharmacy/returns/new',
        loadComponent: () =>
          import('./features/pharmacy/pharmacy-returns/sales-return-entry.component').then(
            (m) => m.SalesReturnEntryComponent
          )
      },
      {
        path: 'pharmacy/returns/approval',
        loadComponent: () =>
          import('./features/pharmacy/pharmacy-returns/sales-return-approval-list.component').then(
            (m) => m.SalesReturnApprovalListComponent
          )
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
