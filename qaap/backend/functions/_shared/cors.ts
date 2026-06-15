const ALLOWED_ORIGINS = [
  "https://qaap.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:4173",
];

const VERCEL_PREVIEW_RE = /^https:\/\/qaap-.*\.vercel\.app$/;

function isAllowed(origin: string): boolean {
  return ALLOWED_ORIGINS.includes(origin) || VERCEL_PREVIEW_RE.test(origin);
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
