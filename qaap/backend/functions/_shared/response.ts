import { corsHeaders } from "./cors.ts";

export function preflight(): Response {
  return new Response("ok", { headers: corsHeaders });
}

export function ok<T>(data: T): Response {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}

export function error(
  message: string,
  status: number = 400,
): Response {
  return new Response(JSON.stringify({ error: message }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}
