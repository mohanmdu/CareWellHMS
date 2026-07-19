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
        path: 'masters/ip-billing-categories',
        loadComponent: () =>
          import('./features/masters-admin/ip-billing-categories/ip-billing-category-list.component').then(
            (m) => m.IpBillingCategoryListComponent
          )
      },
      {
        path: 'masters/ip-billing-components',
        loadComponent: () =>
          import('./features/masters-admin/ip-billing-components/ip-billing-component-list.component').then(
            (m) => m.IpBillingComponentListComponent
          )
      },
      {
        path: 'masters/ip-billing-activity-log',
        loadComponent: () =>
          import('./features/masters-admin/ip-billing-activity-log/ip-billing-activity-log.component').then(
            (m) => m.IpBillingActivityLogComponent
          )
      },
      {
        path: 'ip/reports/consultant-wise',
        loadComponent: () =>
          import('./features/ip-admission/reports/consultant-wise-report.component').then(
            (m) => m.ConsultantWiseReportComponent
          )
      },
      {
        path: 'ip/reports/admission',
        loadComponent: () =>
          import('./features/ip-admission/reports/admission-report.component').then((m) => m.AdmissionReportComponent)
      },
      {
        path: 'ip/reports/admission/:id/bill',
        loadComponent: () =>
          import('./features/ip-admission/reports/provisional-bill.component').then((m) => m.ProvisionalBillComponent)
      },
      {
        path: 'ip/reports/advance',
        loadComponent: () =>
          import('./features/ip-admission/reports/advance-report.component').then((m) => m.AdvanceReportComponent)
      },
      {
        path: 'ip/reports/advance-cancel',
        loadComponent: () =>
          import('./features/ip-admission/reports/advance-cancel.component').then((m) => m.AdvanceCancelComponent)
      },
      {
        path: 'ip/reports/cancelled-admissions',
        loadComponent: () =>
          import('./features/ip-admission/reports/cancelled-admissions-list.component').then(
            (m) => m.CancelledAdmissionsListComponent
          )
      },
      {
        path: 'ip/reports/cancelled-admissions/:id',
        loadComponent: () =>
          import('./features/ip-admission/reports/cancelled-admission-detail.component').then(
            (m) => m.CancelledAdmissionDetailComponent
          )
      },
      {
        path: 'ip/reports/activity-log',
        loadComponent: () =>
          import('./features/ip-admission/activity-log/activity-log-list.component').then(
            (m) => m.ActivityLogListComponent
          )
      },
      {
        path: 'ip/reports/activity-log/:id',
        loadComponent: () =>
          import('./features/ip-admission/activity-log/activity-log-detail.component').then(
            (m) => m.ActivityLogDetailComponent
          )
      },
      {
        path: 'icd/search',
        loadComponent: () =>
          import('./features/icd/icd-patient-search.component').then((m) => m.IcdPatientSearchComponent)
      },
      {
        path: 'icd/patients/:patientId',
        loadComponent: () =>
          import('./features/icd/icd-patient-diagnosis.component').then((m) => m.IcdPatientDiagnosisComponent)
      },
      {
        path: 'icd/master',
        loadComponent: () =>
          import('./features/icd/icd-code-master-list.component').then((m) => m.IcdCodeMasterListComponent)
      },
      {
        path: 'ip/discharge-summary',
        loadComponent: () =>
          import('./features/ip-admission/discharge-summary/discharge-summary-list.component').then(
            (m) => m.DischargeSummaryListComponent
          )
      },
      {
        path: 'ip/discharge-summary/:admissionId/edit',
        loadComponent: () =>
          import('./features/ip-admission/discharge-summary/discharge-summary-form.component').then(
            (m) => m.DischargeSummaryFormComponent
          )
      },
      {
        path: 'ip/discharge-summary/:admissionId/print',
        loadComponent: () =>
          import('./features/ip-admission/discharge-summary/discharge-summary-print.component').then(
            (m) => m.DischargeSummaryPrintComponent
          )
      },
      {
        path: 'masters/cms/site-content',
        loadComponent: () =>
          import('./features/masters-admin/website-cms/site-content/cms-site-content.component').then(
            (m) => m.CmsSiteContentComponent
          )
      },
      {
        path: 'masters/cms/faqs',
        loadComponent: () =>
          import('./features/masters-admin/website-cms/faqs/cms-faq-list.component').then((m) => m.CmsFaqListComponent)
      },
      {
        path: 'masters/cms/health-packages',
        loadComponent: () =>
          import('./features/masters-admin/website-cms/health-packages/cms-health-package-list.component').then(
            (m) => m.CmsHealthPackageListComponent
          )
      },
      {
        path: 'masters/cms/banner-slides',
        loadComponent: () =>
          import('./features/masters-admin/website-cms/banner-slides/cms-banner-slide-list.component').then(
            (m) => m.CmsBannerSlideListComponent
          )
      },
      {
        path: 'masters/cms/gallery-items',
        loadComponent: () =>
          import('./features/masters-admin/website-cms/gallery-items/cms-gallery-item-list.component').then(
            (m) => m.CmsGalleryItemListComponent
          )
      },
      {
        path: 'masters/cms/news-events',
        loadComponent: () =>
          import('./features/masters-admin/website-cms/news-events/cms-news-event-list.component').then(
            (m) => m.CmsNewsEventListComponent
          )
      },
      {
        path: 'masters/cms/testimonials',
        loadComponent: () =>
          import('./features/masters-admin/website-cms/testimonials/cms-testimonial-list.component').then(
            (m) => m.CmsTestimonialListComponent
          )
      },
      {
        path: 'masters/cms/blog-posts',
        loadComponent: () =>
          import('./features/masters-admin/website-cms/blog-posts/cms-blog-post-list.component').then(
            (m) => m.CmsBlogPostListComponent
          )
      },
      {
        path: 'masters/cms/career-openings',
        loadComponent: () =>
          import('./features/masters-admin/website-cms/career-openings/cms-career-opening-list.component').then(
            (m) => m.CmsCareerOpeningListComponent
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
        path: 'pharmacy/stock-adjustment',
        loadComponent: () =>
          import('./features/pharmacy/stock-adjustment/stock-adjustment.component').then(
            (m) => m.StockAdjustmentComponent
          )
      },
      {
        path: 'pharmacy/purchase-return',
        loadComponent: () =>
          import('./features/pharmacy/purchase-return/purchase-return-entry.component').then(
            (m) => m.PurchaseReturnEntryComponent
          )
      },
      {
        path: 'ip/room-types',
        loadComponent: () =>
          import('./features/ip-admission/rooms/room-type-list.component').then((m) => m.RoomTypeListComponent)
      },
      {
        path: 'ip/rooms',
        loadComponent: () =>
          import('./features/ip-admission/rooms/room-number-list.component').then((m) => m.RoomNumberListComponent)
      },
      {
        path: 'ip/room-availability',
        loadComponent: () =>
          import('./features/ip-admission/rooms/room-availability.component').then((m) => m.RoomAvailabilityComponent)
      },
      {
        path: 'ip/admissions',
        loadComponent: () =>
          import('./features/ip-admission/admissions/admission-worklist.component').then(
            (m) => m.AdmissionWorklistComponent
          )
      },
      {
        path: 'ip/admissions/new',
        loadComponent: () =>
          import('./features/ip-admission/admissions/admission-patient-search.component').then(
            (m) => m.AdmissionPatientSearchComponent
          )
      },
      {
        path: 'ip/admissions/new/success/:admissionId',
        loadComponent: () =>
          import('./features/ip-admission/admissions/admission-registration-success.component').then(
            (m) => m.AdmissionRegistrationSuccessComponent
          )
      },
      {
        path: 'ip/admissions/new/:patientId/register',
        loadComponent: () =>
          import('./features/ip-admission/admissions/admission-registration-form.component').then(
            (m) => m.AdmissionRegistrationFormComponent
          )
      },
      {
        path: 'ip/admissions/:id/admit',
        loadComponent: () =>
          import('./features/ip-admission/admissions/admission-ward-allocation.component').then(
            (m) => m.AdmissionWardAllocationComponent
          )
      },
      {
        path: 'ip/admissions/:id/confirmation',
        loadComponent: () =>
          import('./features/ip-admission/admissions/admission-confirmation.component').then(
            (m) => m.AdmissionConfirmationComponent
          )
      },
      {
        path: 'ip/admissions/:id/ward-change',
        loadComponent: () =>
          import('./features/ip-admission/admissions/ward-change.component').then((m) => m.WardChangeComponent)
      },
      {
        path: 'ip/admissions/:id/ward-change/confirmation',
        loadComponent: () =>
          import('./features/ip-admission/admissions/ward-change-confirmation.component').then(
            (m) => m.WardChangeConfirmationComponent
          )
      },
      {
        path: 'ip/inpatient-list',
        loadComponent: () =>
          import('./features/ip-admission/inpatient-list/inpatient-list.component').then(
            (m) => m.InpatientListComponent
          )
      },
      {
        path: 'ip/admissions/:id/billing',
        loadComponent: () =>
          import('./features/ip-admission/ip-billing/ip-billing-workspace.component').then(
            (m) => m.IpBillingWorkspaceComponent
          )
      },
      {
        path: 'ip/admissions/:id/payment-request',
        loadComponent: () =>
          import('./features/ip-admission/payment-request/payment-request-form.component').then(
            (m) => m.PaymentRequestFormComponent
          )
      },
      {
        path: 'ip/admissions/:id/payment-request/success',
        loadComponent: () =>
          import('./features/ip-admission/payment-request/payment-request-success.component').then(
            (m) => m.PaymentRequestSuccessComponent
          )
      },
      {
        path: 'ip/discharge-list',
        loadComponent: () =>
          import('./features/ip-admission/discharge/discharge-list.component').then((m) => m.DischargeListComponent)
      },
      {
        path: 'cashier/dashboard',
        loadComponent: () =>
          import('./features/cashier/cashier-dashboard.component').then((m) => m.CashierDashboardComponent)
      },
      {
        path: 'cashier/ip-approvals',
        loadComponent: () =>
          import('./features/cashier/ip-approval-queue.component').then((m) => m.IpApprovalQueueComponent)
      },
      {
        path: 'cashier/ip-approvals/:id',
        loadComponent: () =>
          import('./features/cashier/ip-approval-detail.component').then((m) => m.IpApprovalDetailComponent)
      },
      {
        path: 'cashier/ip-approvals/:id/receipt',
        loadComponent: () =>
          import('./features/cashier/advance-receipt.component').then((m) => m.AdvanceReceiptComponent)
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
