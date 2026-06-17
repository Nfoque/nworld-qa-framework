// SSRF guards for user-supplied URLs that the backend fetches with credentials.
// Pentest 2026-06-16: see audits/pentesting/2026-06-16-raptor-scan/REPORT.md (M1, M2).

const PRIVATE_IPV4_RANGES: Array<[number, number]> = [
  [0x0a000000, 0xff000000], // 10.0.0.0/8
  [0xac100000, 0xfff00000], // 172.16.0.0/12
  [0xc0a80000, 0xffff0000], // 192.168.0.0/16
  [0x7f000000, 0xff000000], // 127.0.0.0/8 (loopback)
  [0xa9fe0000, 0xffff0000], // 169.254.0.0/16 (link-local / cloud metadata)
  [0x00000000, 0xff000000], // 0.0.0.0/8
  [0x64400000, 0xffc00000], // 100.64.0.0/10 (carrier-grade NAT)
];

function ipv4ToInt(host: string): number | null {
  const parts = host.split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    if (!/^\d+$/.test(p)) return null;
    const v = Number(p);
    if (v < 0 || v > 255) return null;
    n = (n << 8) >>> 0;
    n = (n + v) >>> 0;
  }
  return n;
}

function isPrivateIpLiteral(host: string): boolean {
  // IPv6 literals are wrapped in []; the rules below cover the common dangerous
  // forms (loopback, link-local, unique-local). Anything that looks like an IPv6
  // address — even an embedded IPv4 — is rejected outright because a full IPv6
  // classifier is out of scope for a Deno Edge runtime.
  const lower = host.toLowerCase();
  if (lower === "::1" || lower === "::") return true;
  if (lower.startsWith("fe80:") || lower.startsWith("fc") || lower.startsWith("fd")) return true;
  if (lower.includes(":")) return true;

  const n = ipv4ToInt(host);
  if (n === null) return false;
  // `&` in JS produces signed 32-bit results — coerce back to unsigned before
  // comparing against the >2³¹ range bases (169.254/16, 192.168/16, 172.16/12).
  return PRIVATE_IPV4_RANGES.some(([base, mask]) => ((n & mask) >>> 0) === base);
}

export interface UrlSafetyOptions {
  // Optional suffix allowlist — hostname must end with one of these (e.g. ".supabase.co").
  allowedHostSuffixes?: string[];
}

export function validateUpstreamUrl(
  raw: string,
  opts: UrlSafetyOptions = {},
): { ok: true; url: URL } | { ok: false; reason: string } {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, reason: "INVALID_URL" };
  }

  if (url.protocol !== "https:") {
    return { ok: false, reason: "URL_SCHEME_NOT_ALLOWED: https only" };
  }

  // URL.hostname strips the [] around IPv6 literals already.
  const host = url.hostname;
  if (!host) return { ok: false, reason: "URL_HOST_EMPTY" };

  if (isPrivateIpLiteral(host)) {
    return { ok: false, reason: "URL_HOST_PRIVATE_OR_LOOPBACK" };
  }

  if (opts.allowedHostSuffixes && opts.allowedHostSuffixes.length > 0) {
    const ok = opts.allowedHostSuffixes.some((suffix) =>
      host === suffix.replace(/^\./, "") || host.endsWith(suffix)
    );
    if (!ok) return { ok: false, reason: "URL_HOST_NOT_ALLOWLISTED" };
  }

  return { ok: true, url };
}
