import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

type SignupRow = {
  id: string;
  confirmation_sent_at: string | null;
};

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      ...jsonHeaders,
      ...init?.headers,
    },
  });
}

function normalizeEmail(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;

  const email = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return undefined;

  return email;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return entities[char];
  });
}

function confirmationEmailHtml(siteUrl: string) {
  const safeSiteUrl = escapeHtml(siteUrl);

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#faf9f5;color:#171512;font-family:Inter,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
      <p style="font-size:12px;letter-spacing:0.28em;text-transform:uppercase;color:#6f6a60;margin:0 0 24px;">
        Phronos
      </p>
      <h1 style="font-family:Georgia,serif;font-size:32px;font-weight:400;line-height:1.1;margin:0 0 16px;color:#171512;">
        You're on the list.
      </h1>
      <p style="font-size:16px;line-height:1.6;margin:0 0 20px;color:#4d4941;">
        Thanks for joining the Phronos waitlist. We'll notify you when there is news to share.
      </p>
      <p style="font-size:14px;line-height:1.6;margin:0;color:#6f6a60;">
        You signed up at <a href="${safeSiteUrl}" style="color:#171512;">${safeSiteUrl}</a>.
      </p>
    </div>
  </body>
</html>`;
}

async function sendConfirmation(email: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    return { error: "Missing RESEND_API_KEY or RESEND_FROM_EMAIL" };
  }

  const siteUrl = process.env.SITE_URL ?? "https://phronos.ai";
  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from,
    to: email,
    subject: "You're on the Phronos list",
    text: `You're on the Phronos list.\n\nThanks for joining. We'll notify you when there is news to share.\n\n${siteUrl}`,
    html: confirmationEmailHtml(siteUrl),
  });

  if (error) {
    return { error: error.message };
  }

  return { id: data?.id };
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        allow: "POST, OPTIONS",
      },
    });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, { status: 405 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("Missing Supabase environment variables");
    return jsonResponse({ error: "Signup service is not configured" }, { status: 500 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = normalizeEmail((payload as { email?: unknown } | null)?.email);
  if (!email) {
    return jsonResponse({ error: "Enter a valid email address" }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const existing = await supabase
    .from("waitlist_signups")
    .select("id, confirmation_sent_at")
    .eq("email", email)
    .maybeSingle<SignupRow>();

  if (existing.error) {
    console.error(existing.error);
    return jsonResponse({ error: "Could not save signup" }, { status: 500 });
  }

  if (existing.data) {
    return jsonResponse({ ok: true });
  }

  const inserted = await supabase
    .from("waitlist_signups")
    .insert({ email })
    .select("id, confirmation_sent_at")
    .single<SignupRow>();

  if (inserted.error) {
    if (inserted.error.code === "23505") {
      return jsonResponse({ ok: true });
    }

    console.error(inserted.error);
    return jsonResponse({ error: "Could not save signup" }, { status: 500 });
  }

  const confirmation = await sendConfirmation(email);

  if ("id" in confirmation && confirmation.id) {
    const { error } = await supabase
      .from("waitlist_signups")
      .update({
        confirmation_sent_at: new Date().toISOString(),
        confirmation_email_id: confirmation.id,
        confirmation_error: null,
      })
      .eq("id", inserted.data.id);

    if (error) console.error(error);
  } else if ("error" in confirmation) {
    const { error } = await supabase
      .from("waitlist_signups")
      .update({ confirmation_error: confirmation.error })
      .eq("id", inserted.data.id);

    if (error) console.error(error);
  }

  return jsonResponse({ ok: true });
}

export const config = {
  path: "/api/notify",
};
