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
}
