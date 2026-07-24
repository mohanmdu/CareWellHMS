export type ThemeMode = 'LIGHT' | 'DARK' | 'CUSTOM' | 'AUTO';
export type CornerRadiusStyle = 'SQUARE' | 'ROUNDED' | 'PILL';

export const THEME_MODE_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'LIGHT', label: 'Light' },
  { value: 'DARK', label: 'Dark' },
  { value: 'CUSTOM', label: 'Custom' },
  { value: 'AUTO', label: 'Follow system' }
];

export const CORNER_RADIUS_STYLE_OPTIONS: { value: CornerRadiusStyle; label: string }[] = [
  { value: 'SQUARE', label: 'Square' },
  { value: 'ROUNDED', label: 'Rounded' },
  { value: 'PILL', label: 'Pill' }
];

/** Curated allowlist, not free text - see ThemeService for why. */
export const FONT_FAMILY_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Default' },
  { value: "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif", label: 'System (default)' },
  { value: "Georgia, 'Times New Roman', serif", label: 'Georgia (serif)' },
  { value: "'Trebuchet MS', Verdana, sans-serif", label: 'Trebuchet MS' },
  { value: "'Courier New', monospace", label: 'Courier New (monospace)' }
];

/**
 * The application's out-of-the-box theme - restored by "Reset Theme & Appearance".
 * Colors/font are null (inherit the compiled stylesheet defaults in
 * styles/_tokens.scss) rather than hardcoded hex values, so this reset stays
 * correct even if that palette changes later; themeMode/cornerRadiusStyle
 * are non-nullable columns and get their DB/entity default explicitly.
 */
export const DEFAULT_THEME_SETTINGS: Pick<
  ClinicSettings,
  | 'themeMode'
  | 'themePrimaryColor'
  | 'themeSecondaryColor'
  | 'themeTertiaryColor'
  | 'fontFamily'
  | 'cornerRadiusStyle'
  | 'headerBackgroundColor'
  | 'footerBackgroundColor'
  | 'footerText'
> = {
  themeMode: 'LIGHT',
  themePrimaryColor: null,
  themeSecondaryColor: null,
  themeTertiaryColor: null,
  fontFamily: null,
  cornerRadiusStyle: 'ROUNDED',
  headerBackgroundColor: null,
  footerBackgroundColor: null,
  footerText: null
};

export interface ClinicSettings {
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
  tinNo: string | null;
  dlNo: string | null;
  websiteEnabled: boolean;
  domain: string | null;
  themePrimaryColor: string | null;
  themeSecondaryColor: string | null;
  faviconUrl: string | null;
  seoDefaultTitle: string | null;
  seoDefaultDescription: string | null;
  socialFacebookUrl: string | null;
  socialInstagramUrl: string | null;
  socialYoutubeUrl: string | null;
  whatsappNumber: string | null;
  themeMode: ThemeMode;
  themeTertiaryColor: string | null;
  fontFamily: string | null;
  cornerRadiusStyle: CornerRadiusStyle;
  headerBackgroundColor: string | null;
  footerBackgroundColor: string | null;
  footerText: string | null;
}
