export interface NavItem {
  label: string;
  route: string;
  icon: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/**
 * Grouped primary navigation shown in the app shell sidenav. Mirrors the
 * feature module boundaries in src/app/features (migration doc §6.1).
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Patient Registration',
    items: [
      { label: 'Patients', route: '/registration/patients', icon: 'person_add' },
      { label: 'Patient Past History', route: '/registration/patients/history', icon: 'history_edu' },
      { label: 'Review Date Report', route: '/registration/patients/review-date-report', icon: 'event_repeat' },
      { label: 'Logs', route: '/registration/patients/logs', icon: 'history' }
    ]
  },
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', route: '/dashboard', icon: 'dashboard' }]
  },
  {
    label: 'Appointments',
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
    label: 'Billing & Insurance',
    items: [
      { label: 'Billing Catalog', route: '/billing/catalog', icon: 'sell' },
      { label: 'New Invoice', route: '/billing/invoices/new', icon: 'receipt_long' },
      { label: 'Invoices', route: '/billing/invoices', icon: 'request_quote' },
      { label: 'Insurance Claims', route: '/insurance/claims', icon: 'health_and_safety' }
    ]
  },
  {
    label: 'Lab & Radiology',
    items: [
      { label: 'New Requisition', route: '/lab/requisitions/new', icon: 'add_box' },
      { label: 'Lab Worklist', route: '/lab/requisitions', icon: 'biotech' }
    ]
  },
  {
    label: 'Pharmacy',
    items: [{ label: 'Inventory Master', route: '/pharmacy/inventory-master', icon: 'inventory_2' }]
  },
  {
    label: 'IP Admission',
    items: [
      { label: 'Rooms', route: '/ip/rooms', icon: 'bed' },
      { label: 'IP Admissions', route: '/ip/admissions', icon: 'local_hospital' }
    ]
  },
  {
    label: 'Masters & Admin',
    items: [
      { label: 'Departments', route: '/masters/departments', icon: 'apartment' },
      { label: 'Consultants', route: '/masters/consultants', icon: 'medical_services' },
      { label: 'Specializations', route: '/masters/specializations', icon: 'workspace_premium' },
      { label: 'OP Billing Categories', route: '/masters/op-billing-categories', icon: 'category' },
      { label: 'OP Billing Components', route: '/masters/op-billing-components', icon: 'sell' },
      { label: 'Roles', route: '/masters/roles', icon: 'admin_panel_settings' },
      { label: 'General Users', route: '/masters/general-users', icon: 'group' },
      { label: 'Master Audit Logs', route: '/masters/general-users/logs', icon: 'history' },
      { label: 'Clinic Settings', route: '/masters/clinic-settings', icon: 'settings' }
    ]
  }
];
