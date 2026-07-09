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
    label: 'Overview',
    items: [{ label: 'Dashboard', route: '/dashboard', icon: 'dashboard' }]
  },
  {
    label: 'Registration & Appointments',
    items: [
      { label: 'Book Appointment', route: '/appointments/book', icon: 'event_available' },
      { label: 'Appointments', route: '/appointments', icon: 'event' }
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
    items: [
      { label: 'Drugs', route: '/pharmacy/drugs', icon: 'medication' },
      { label: 'Stock', route: '/pharmacy/stock', icon: 'inventory_2' },
      { label: 'Dispense', route: '/pharmacy/dispense', icon: 'local_pharmacy' },
      { label: 'Pharmacy Sales', route: '/pharmacy/sales', icon: 'point_of_sale' }
    ]
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
      { label: 'Roles', route: '/masters/roles', icon: 'admin_panel_settings' }
    ]
  }
];
