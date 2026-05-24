# Project Setup Guide

This guide covers the accounts and production setup for the Phronos waitlist site:

- Netlify deploy from GitHub
- Supabase email storage
- Resend confirmation emails
- Your Netlify account hosting the site
- Your friend's Netlify account managing the domain DNS
- Namecheap email records preserved in the active DNS zone

## 1. GitHub

Create a GitHub repository for the project and push the code there.

Netlify will deploy from this repository, so the repository should be owned by the person or organization that should control production long term. If the project belongs to a team, use a shared GitHub organization if possible.

## 2. Your Netlify Site

Create a new Netlify site from the GitHub repository in your own Netlify account.

Recommended build settings:

```text
Build command: bun run build
Publish directory: dist/client
```

The implementation will also add a `netlify.toml` file so these settings are versioned in the project.

After the first deploy, copy your temporary Netlify URL. It will look like:

```text
https://your-site-name.netlify.app
```

This URL is what your friend will point the domain DNS to.

In your Netlify site, add these environment variables with Functions/runtime access:

```text
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
SITE_URL=
```

Suggested values:

```text
RESEND_FROM_EMAIL=Phronos <hello@yourdomain.com>
SITE_URL=https://yourdomain.com
```

Do not expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code. It must only be used inside the Netlify Function.

## 3. Connect The Domain Across Two Netlify Accounts

The project is deployed in your Netlify account, but the domain DNS is managed in your friend's Netlify account.

This is okay. Your friend does not need to add you as a team member. He only needs to add DNS records in his Netlify DNS.

### Recommended Domain Setup

Use `www.yourdomain.com` for the site if possible. It is the easiest cross-account setup.

In your Netlify account:

1. Open your deployed site.
2. Go to **Site configuration** -> **Domain management**.
3. Add the custom domain, for example:

```text
www.yourdomain.com
```

4. Netlify may say the domain needs external DNS configuration. That is expected.
5. Copy your Netlify site hostname:

```text
your-site-name.netlify.app
```

Send this to your friend.

In your friend's Netlify account:

1. Open the domain DNS settings.
2. Add or update this DNS record:

```text
Type:  CNAME
Name:  www
Value: your-site-name.netlify.app
TTL:   Auto/default
```

3. Save the record.
4. Wait for DNS propagation.
5. In your Netlify site, click **Verify DNS configuration** or wait for Netlify to detect it.
6. Netlify should issue HTTPS automatically.

### Root Domain Option

If you want `yourdomain.com` without `www`, cross-account setup can be harder.

The cleanest free setup is:

```text
www.yourdomain.com -> your Netlify site
yourdomain.com     -> redirect to www.yourdomain.com
```

Your friend can configure the root domain redirect from his DNS/site setup if needed. If Netlify blocks root-domain use across accounts, use `www` as the production URL.

### What Not To Do

Do not change the domain nameservers unless you both agree to move DNS ownership.

Do not delete existing email records. The email is hosted through Namecheap, so the Namecheap MX/TXT records must stay in the active DNS zone, which is currently your friend's Netlify DNS.

## 4. Supabase

Create a Supabase project.

From the Supabase dashboard, collect:

```text
Project URL -> SUPABASE_URL
Service role key -> SUPABASE_SERVICE_ROLE_KEY
```

Use the service role key only in Netlify environment variables. Do not commit it and do not put it in any `VITE_` variable.

The implementation will add SQL for a `waitlist_signups` table with:

- unique normalized email storage
- signup timestamps
- confirmation email delivery tracking
- Row Level Security enabled
- no public insert policy, because writes happen through the server-side Netlify Function

## 5. Resend

Create a Resend account under the person or team that should own production email sending.

Add the production domain in Resend. Resend will provide DNS records for domain verification and email authentication. These usually include DKIM and SPF/TXT records, and may include DMARC or return-path records.

Because your friend's Netlify account manages the active DNS zone, your friend must add the Resend DNS records in his Netlify DNS.

Use a sender like:

```text
Phronos <hello@yourdomain.com>
```

Avoid `no-reply@yourdomain.com` for this project. A real reply address feels better and lets early users respond.

Create a Resend API key and add it to Netlify:

```text
RESEND_API_KEY=
RESEND_FROM_EMAIL=Phronos <hello@yourdomain.com>
```

## 6. Preserve Namecheap Email

Email is hosted through Namecheap, but DNS is managed in your friend's Netlify account.

That means Namecheap email only works if the required Namecheap email DNS records are present in Netlify DNS.

Your friend should check the active DNS records in his Netlify account and make sure the Namecheap email records are still there.

Typical Namecheap Private Email records may include:

```text
Type:  MX
Name:  @
Value: mx1.privateemail.com

Type:  MX
Name:  @
Value: mx2.privateemail.com

Type:  TXT
Name:  @
Value: SPF value from Namecheap
```

Do not guess these records. Copy the exact values from Namecheap's email setup instructions or from the existing working DNS records.

## 7. Add Resend DNS Records

Add the records from Resend inside your friend's Netlify DNS.

Do not guess these records. Copy the exact names, types, and values from Resend.

Typical records may look like:

```text
TXT    yourdomain.com          SPF or verification value
TXT    resend._domainkey       DKIM value
TXT    _dmarc                  DMARC policy
```

Resend verification may take a few minutes or longer after DNS records are added.

Important: if both Namecheap email and Resend provide SPF/TXT records for the root domain, do not create duplicate SPF records. There should normally be one SPF TXT record that includes the needed senders. If this happens, combine the SPF includes carefully or ask before changing it.

## 8. Production Signup Flow

Expected final flow:

1. Visitor enters email on the existing landing page.
2. Browser sends `POST /api/notify`.
3. Netlify Function validates and normalizes the email.
4. Function stores the email in Supabase.
5. Function sends a confirmation email through Resend for new signups.
6. Page shows a friendly success message.

Duplicate signups should return success without revealing whether the email was already stored.

## 9. Supabase Health Check

The project includes a Netlify Scheduled Function at `netlify/functions/supabase-health.ts`.

It runs once per day and performs a small read-only query against `waitlist_signups`. This gives Netlify logs a daily database connectivity signal and helps keep the Supabase project active while the site is early.

It does not:

- add fake signups
- change existing rows
- send emails
- affect visitors

This is a lightweight safeguard, not a replacement for a paid Supabase plan if signup capture becomes business-critical.

## 10. Final Checks

Before production launch:

```text
bun install
bun run lint
bun run build
```

Also verify:

- Netlify deploy succeeds from GitHub.
- `www.yourdomain.com` points to your Netlify site.
- HTTPS is active in your Netlify site.
- Supabase table exists.
- Netlify environment variables are set.
- Resend domain is verified.
- Namecheap email still receives mail after DNS changes.
- A real signup stores an email in Supabase.
- A new signup receives the confirmation email.
- Duplicate signup does not send repeated confirmation emails.
