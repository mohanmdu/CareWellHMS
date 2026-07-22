import { environment } from '../../environments/environment';
import { NavGroup, NAV_GROUPS } from './nav-config';

/** One entry per NavGroup in nav-config.ts - keep these in sync. */
export type ModuleKey =
  | 'overview'
  | 'patient-registration'
  | 'appointments'
  | 'billing'
  | 'insurance'
  | 'lab'
  | 'upload-reports'
  | 'pharmacy'
  | 'icd-codes'
  | 'room-ward'
  | 'ip-admission'
  | 'cashier'
  | 'discharge-summary'
  | 'ip-billing-master'
  | 'website-cms'
  | 'masters'
  | 'administration';

export type PackageTier = 'BASIC' | 'STANDARD' | 'PREMIUM';

/**
 * Which modules a deployment's sidenav shows, per package tier. Tiers are
 * additive (STANDARD = everything in BASIC plus more, PREMIUM = everything
 * in STANDARD plus more) - a client upgrading their package should never
 * lose a module they already had.
 *
 * 'overview', 'masters', and 'administration' are deliberately in every
 * tier - a deployment needs at least basic user/role/clinic-settings
 * administration to function regardless of which clinical modules it's
 * licensed for.
 *
 * Static config, no admin UI: the active tier is set once per deployment via
 * environment.activePackage. Changing a client's package means a redeploy,
 * not a runtime settings toggle - see the "package config" note in the
 * unified-patient-identity discussion for why this was chosen over a
 * backend-driven admin screen (cheaper to build now, easy to graduate to
 * later without changing how NAV_GROUPS itself is structured).
 */
const ALWAYS_ON: ModuleKey[] = ['overview', 'masters', 'administration'];

export const PACKAGES: Record<PackageTier, ModuleKey[]> = {
  BASIC: [...ALWAYS_ON, 'patient-registration', 'appointments', 'billing'],
  STANDARD: [...ALWAYS_ON, 'patient-registration', 'appointments', 'billing', 'lab', 'upload-reports', 'pharmacy', 'icd-codes'],
  PREMIUM: [
    ...ALWAYS_ON,
    'patient-registration',
    'appointments',
    'billing',
    'lab',
    'upload-reports',
    'pharmacy',
    'icd-codes',
    'insurance',
    'room-ward',
    'ip-admission',
    'cashier',
    'discharge-summary',
    'ip-billing-master',
    'website-cms'
  ]
};

function activeModuleKeys(): ModuleKey[] {
  const tier = (environment as { activePackage?: PackageTier }).activePackage ?? 'PREMIUM';
  return PACKAGES[tier] ?? PACKAGES.PREMIUM;
}

/** Sidenav groups for the deployment's active package, in nav-config.ts's defined order. */
export function getVisibleNavGroups(): NavGroup[] {
  const enabled = new Set(activeModuleKeys());
  return NAV_GROUPS.filter((group) => enabled.has(group.moduleKey));
}
