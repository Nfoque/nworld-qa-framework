export interface TenantBranding {
  primaryColor?: string;
  primaryColorLight?: string;
  primaryColorDark?: string;
  logoUrl?: string;
  accentColor?: string;
  loginMessage?: string;
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  branding: TenantBranding;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: "superadmin" | "admin" | "editor" | "viewer";
  avatarUrl: string | null;
  tenantId: string | null;
  tenant: Tenant | null;
  createdAt: string;
}
