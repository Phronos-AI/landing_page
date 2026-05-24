import { createClient } from "@supabase/supabase-js";

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...init?.headers,
    },
  });
}

export default async function handler(): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("Missing Supabase environment variables for scheduled health check");
    return jsonResponse({ ok: false, error: "Supabase is not configured" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { error } = await supabase.from("waitlist_signups").select("id").limit(1);

  if (error) {
    console.error("Supabase scheduled health check failed", error);
    return jsonResponse({ ok: false, error: "Supabase health check failed" }, { status: 500 });
  }

  console.log("Supabase scheduled health check succeeded");
  return jsonResponse({ ok: true });
}

export const config = {
  schedule: "@daily",
};
