import type { ModuleKey } from './package-config';

export interface NavItem {
  label: string;
  route: string;
  icon: string;
}

export interface NavGroup {
  label: string;
  moduleKey: ModuleKey;
  items: NavItem[];
}

/**
 * Grouped primary navigation shown in the app shell sidenav. Mirrors the
 * feature module boundaries in src/app/features (migration doc §6.1).
 *
 * Group ORDER follows the legacy system's own menu sequence (screenshot
 * reference, 2026-07-22) as closely as this app's actual module boundaries
 * allow. Two legacy entries were finer-grained than our existing groups, so
 * they're split here to preserve that ordering: "Billing & Insurance" ->
 * Billing + Insurance Module; "Masters & Admin" -> Masters + Administration.
 * Three groups (Cashier Module, ICD Codes Module, Website CMS) don't appear
 * in that reference screenshot at all - they're placed at the most
 * defensible adjacent position (Cashier right after IP Admission, ICD right
 * after Discharge Summary, Website CMS near the end with other back-office
 * concerns) rather than guessed into an exact legacy slot. Five legacy
 * modules with no equivalent screen yet (Pharmacy MIS, CEO/MD Dashboard as
 * its own module, FAQ/How to use HMS, OP/IP Case Sheet) are intentionally
 * left out rather than stubbed - see moduleKey/package-config.ts for how
 * this list is filtered per package tier.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Patient Registration',
    moduleKey: 'patient-registration',
    items: [
      { label: 'Patients', route: '/registration/patients', icon: 'person_add' },
      { label: 'Patient Past History', route: '/registration/patients/history', icon: 'history_edu' },
      { label: 'Review Date Report', route: '/registration/patients/review-date-report', icon: 'event_repeat' },
      { label: 'Logs', route: '/registration/patients/logs', icon: 'history' }
    ]
  },
  {
    label: 'Appointments',
    moduleKey: 'appointments',
    items: [
      { label: 'Book Appointment', route: '/appointments/book', icon: 'event_available' },
      { label: 'OP Direct Billing', route: '/appointments/direct-billing', icon: 'point_of_sale' },
      { label: 'Appointments', route: '/appointments', icon: 'event' },
      { label: 'Patient Prescription', route: '/appointments/prescriptions', icon: 'description' },
      { label: 'Collection Report', route: '/appointments/reports/collection', icon: 'summarize' },
      { label: 'Refund & Report', route: '/appointments/refunds', icon: 'currency_exchange' },
      { label: 'Appointment Audit Logs', route: '/appointments/audit-logs', icon: 'history' }
    ]
  },
  {
    label: 'Lab & Investigations',
    moduleKey: 'lab',
    items: [
      { label: 'Lab Requisition', route: '/lab/requisitions', icon: 'assignment_add' },
      { label: 'Lab & X-Ray/Scan Billing', route: '/lab/billing', icon: 'point_of_sale' },
      { label: 'Lab Entry Queue & Report', route: '/lab/test-entries', icon: 'fact_check' },
      { label: 'Lab Draft Report', route: '/lab/test-entries/draft', icon: 'drafts' },
      { label: 'Lab Approved Report/Reports Share to WhatsApp', route: '/lab/test-entries/approved', icon: 'verified' },
      { label: 'Lab Category', route: '/lab/masters/categories', icon: 'category' },
      { label: 'Lab Sub-Category', route: '/lab/masters/sub-categories', icon: 'list_alt' },
      { label: 'Lab Component', route: '/lab/masters/components', icon: 'science' },
      { label: 'Summary Collection Report', route: '/lab/reports/summary-collection', icon: 'summarize' },
      { label: 'Lab Detail Collection Report', route: '/lab/reports/lab-detail-collection', icon: 'receipt_long' },
      {
        label: 'Investigation Detail Collection Report',
        route: '/lab/reports/investigation-detail-collection',
        icon: 'receipt_long'
      },
      { label: 'Payment Refund', route: '/lab/refunds', icon: 'currency_exchange' },
      { label: 'Refund Report', route: '/lab/reports/refund', icon: 'assignment_return' },
      { label: 'Cancelled Report', route: '/lab/reports/cancelled', icon: 'event_busy' }
    ]
  },
  {
    label: 'Upload Reports',
    moduleKey: 'upload-reports',
    items: [
      { label: 'Upload Reports', route: '/patient-reports/upload', icon: 'upload_file' },
      { label: 'View Files/Reports share to WhatsApp', route: '/patient-reports/view', icon: 'folder_shared' },
      { label: 'Audit Log', route: '/patient-reports/audit-log', icon: 'fact_check' }
    ]
  },
  {
    label: 'IP Admission',
    moduleKey: 'ip-admission',
    items: [
      { label: 'New Admission', route: '/ip/admissions/new', icon: 'person_add' },
      { label: 'IP Admissions', route: '/ip/admissions', icon: 'local_hospital' },
      { label: 'In Patient List', route: '/ip/inpatient-list', icon: 'groups' },
      { label: 'Discharge List', route: '/ip/discharge-list', icon: 'assignment_turned_in' }
    ]
  },
  {
    label: 'Cashier Module',
    moduleKey: 'cashier',
    items: [{ label: 'Approvals/Refund', route: '/cashier/dashboard', icon: 'fact_check' }]
  },
  {
    label: 'IP Billing Master',
    moduleKey: 'ip-billing-master',
    items: [
      { label: 'IP Billing Categories', route: '/masters/ip-billing-categories', icon: 'category' },
      { label: 'IP Billing Components', route: '/masters/ip-billing-components', icon: 'sell' },
      { label: 'Billing Activity Log', route: '/masters/ip-billing-activity-log', icon: 'history' },
      { label: 'Consultant Wise Report', route: '/ip/reports/consultant-wise', icon: 'summarize' },
      { label: 'Admission Report', route: '/ip/reports/admission', icon: 'receipt_long' },
      { label: 'Advance Report', route: '/ip/reports/advance', icon: 'payments' },
      { label: 'Advance Cancel', route: '/ip/reports/advance-cancel', icon: 'cancel' },
      { label: 'Cancelled Admissions', route: '/ip/reports/cancelled-admissions', icon: 'event_busy' },
      { label: 'IP/OP Tracking Report', route: '/ip/reports/activity-log', icon: 'manage_search' }
    ]
  },
  {
    label: 'Discharge Summary Module',
    moduleKey: 'discharge-summary',
    items: [
      { label: 'Discharge Initiated List', route: '/ip/discharge-summary/initiated', icon: 'pending_actions' },
      { label: 'Discharge List', route: '/ip/discharge-summary', icon: 'assignment' }
    ]
  },
  {
    label: 'ICD Codes Module',
    moduleKey: 'icd-codes',
    items: [
      { label: 'ICD Code Search', route: '/icd/search', icon: 'travel_explore' },
      { label: 'ICD Code Master', route: '/icd/master', icon: 'menu_book' }
    ]
  },
  {
    label: 'Room / Ward Management',
    moduleKey: 'room-ward',
    items: [
      { label: 'Room Types', route: '/ip/room-types', icon: 'apartment' },
      { label: 'Room Numbers', route: '/ip/rooms', icon: 'bed' },
      { label: 'Room Availability', route: '/ip/room-availability', icon: 'meeting_room' }
    ]
  },
  {
    label: 'Billing',
    moduleKey: 'billing',
    items: [
      { label: 'Billing Catalog', route: '/billing/catalog', icon: 'sell' },
      { label: 'New Invoice', route: '/billing/invoices/new', icon: 'receipt_long' },
      { label: 'Invoices', route: '/billing/invoices', icon: 'request_quote' }
    ]
  },
  {
    label: 'Insurance Module',
    moduleKey: 'insurance',
    items: [
      { label: 'Pre Authorization Requests', route: '/insurance/pre-authorization', icon: 'health_and_safety' },
      { label: 'Insurance Approval Queue', route: '/insurance/approval-queue', icon: 'fact_check' },
      { label: 'Insurance Claim Report', route: '/insurance/claim-report', icon: 'request_quote' },
      { label: 'Insurance Rejected Report', route: '/insurance/rejected-report', icon: 'cancel' },
      { label: 'Insurance Companies', route: '/insurance/companies', icon: 'domain' }
    ]
  },
  {
    label: 'Pharmacy',
    moduleKey: 'pharmacy',
    items: [
      { label: 'Inventory Master', route: '/pharmacy/inventory-master', icon: 'inventory_2' },
      { label: 'Purchase Management', route: '/pharmacy/purchase-management', icon: 'shopping_cart' },
      { label: 'Pharmacy Billing', route: '/pharmacy/billing', icon: 'point_of_sale' },
      { label: 'Sales Return', route: '/pharmacy/returns/new', icon: 'assignment_return' },
      { label: 'Sales Return Approval', route: '/pharmacy/returns/approval', icon: 'fact_check' },
      { label: 'Stock Adjustment', route: '/pharmacy/stock-adjustment', icon: 'tune' },
      { label: 'Purchase Return', route: '/pharmacy/purchase-return', icon: 'undo' },
      { label: 'Pharmacy Reports', route: '/pharmacy/reports', icon: 'summarize' }
    ]
  },
  {
    label: 'Overview',
    moduleKey: 'overview',
    items: [{ label: 'Dashboard', route: '/dashboard', icon: 'dashboard' }]
  },
  {
    label: 'Website CMS',
    moduleKey: 'website-cms',
    items: [
      { label: 'Site Content', route: '/masters/cms/site-content', icon: 'article' },
      { label: 'Banner Slides', route: '/masters/cms/banner-slides', icon: 'wallpaper' },
      { label: 'Gallery', route: '/masters/cms/gallery-items', icon: 'photo_library' },
      { label: 'News & Events', route: '/masters/cms/news-events', icon: 'campaign' },
      { label: 'Testimonials', route: '/masters/cms/testimonials', icon: 'format_quote' },
      { label: 'FAQs', route: '/masters/cms/faqs', icon: 'quiz' },
      { label: 'Health Packages', route: '/masters/cms/health-packages', icon: 'medical_information' },
      { label: 'Blog Posts', route: '/masters/cms/blog-posts', icon: 'article' },
      { label: 'Career Openings', route: '/masters/cms/career-openings', icon: 'work' }
    ]
  },
  {
    label: 'Masters',
    moduleKey: 'masters',
    items: [
      { label: 'Departments', route: '/masters/departments', icon: 'apartment' },
      { label: 'Consultants', route: '/masters/consultants', icon: 'medical_services' },
      { label: 'Specializations', route: '/masters/specializations', icon: 'workspace_premium' },
      { label: 'OP Billing Categories', route: '/masters/op-billing-categories', icon: 'category' },
      { label: 'OP Billing Components', route: '/masters/op-billing-components', icon: 'sell' }
    ]
  },
  {
    label: 'Administration',
    moduleKey: 'administration',
    items: [
      { label: 'Roles', route: '/masters/roles', icon: 'admin_panel_settings' },
      { label: 'General Users', route: '/masters/general-users', icon: 'group' },
      { label: 'Master Audit Logs', route: '/masters/general-users/logs', icon: 'history' },
      { label: 'Clinic Settings', route: '/masters/clinic-settings', icon: 'settings' }
    ]
  }
];
