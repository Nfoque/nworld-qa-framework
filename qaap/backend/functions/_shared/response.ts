import { getCorsHeaders } from "./cors.ts";

export function preflight(req: Request): Response {
  return new Response("ok", { headers: getCorsHeaders(req) });
}

export function ok<T>(req: Request, data: T): Response {
  return new Response(JSON.stringify(data), {
    headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    status: 200,
  });
}

export function error(
  req: Request,
  message: string,
  status: number = 400,
): Response {
  return new Response(JSON.stringify({ error: message }), {
    headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    status,
  });
}

// deno-lint-ignore no-explicit-any
export async function parseBody(req: Request): Promise<any | Response> {
  try {
    return await req.json();
  } catch {
    return error(req, "INVALID_JSON", 400);
  }
}
