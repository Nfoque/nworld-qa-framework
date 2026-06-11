export interface Tenant {
  id: string;
  slug: string;
  name: string;
  branding: Record<string, string>;
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
