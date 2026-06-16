// Pentest 2026-06-16: dropped the `qaap-*.vercel.app` wildcard regex (H1 in the
// audit report). Any attacker can register a Vercel project named `qaap-evil`
// and obtain `https://qaap-evil.vercel.app`, which the old regex accepted.
// Preview origins are now declared explicitly via env var.

const BASE_ALLOWED_ORIGINS = [
  "https://qaap.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:4173",
];

function parseExtraOrigins(): string[] {
  const raw = Deno.env.get("CORS_ALLOWED_ORIGINS");
  if (!raw) return [];
  return raw
    .split(",")
    .map((o) => o.trim())
    .filter((o) => o.length > 0);
}

const ALLOWED_ORIGINS = [...BASE_ALLOWED_ORIGINS, ...parseExtraOrigins()];

function isAllowed(origin: string): boolean {
  return ALLOWED_ORIGINS.includes(origin);
}

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": isAllowed(origin)
      ? origin
      : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-tenant-id",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Vary": "Origin",
  };
}
