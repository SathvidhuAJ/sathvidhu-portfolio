# Vercel contact email setup

Local code is prepared. No account resources, DNS records, Git remotes, repositories or deployments have been created or changed. No real email has been sent. The user confirmed that no verified sending domain is currently available.

## Local development and verification

Use Node.js 24 and the existing Python Playwright installation for browser QA. The application has zero npm dependencies; no npm install is needed locally.

```powershell
npm.cmd run check
npm.cmd test
npm.cmd run build
npm.cmd run dev
```

The Vercel-style local preview is **http://127.0.0.1:8766/**. `npm run dev` builds the static output before serving it. Restart it after changing API code, or run `npm run build` after changing frontend source. The server deliberately ignores real shell email credentials and always disables sending. It does not read `.env` files. This prevents accidental real email during local QA.

The original Netlify source can be previewed separately:

```powershell
python -m http.server 8765 --bind 127.0.0.1 --directory public
python audit/test_browser.py
python audit/local_verify.py
python audit/vercel_browser.py
```

The Python tests require Python Playwright and its Chromium browser to be installed. They are verification tools, not application runtime dependencies. Contact traffic in browser tests is mocked; the Vercel browser test also checks the disabled localhost endpoint. Node API tests inject mocked Redis/Resend responses and never call real services.

## Deployment settings — only after explicit approval

| Setting | Value |
| --- | --- |
| Repository root | The directory containing package.json, vercel.json and api/ |
| Framework preset | Other (`framework: null`) |
| Node.js | 24.x, pinned in package.json |
| Build command | `node scripts/build-vercel.cjs` (or `npm run build`) |
| Output directory | `dist` |
| Install command | No dependencies to install; the platform default npm install is harmless, or explicitly skip it |
| API | Root `api/contact.js`, served at `/api/contact` |
| API duration | 30 seconds; outgoing rate check has a 3-second timeout and Resend a 10-second timeout |
| Rewrites | None. Do not add an SPA catch-all rewrite |

The build copies only public assets to dist/, changes the contact provider to Resend and the action to /api/contact, and removes Netlify-only form metadata from the generated HTML. It does not modify public/. The API remains outside static output, where Vercel's Node function builder detects it. Actual Vercel function packaging/routing must be confirmed in a deployment; the local server is not the Vercel runtime.

[Vercel Node runtime and API routing](https://vercel.com/docs/functions/runtimes/node-js), [build settings](https://vercel.com/docs/builds/configure-a-build), [supported Node versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).

## Provider and domain setup

1. Obtain control of a sending domain or subdomain. A Netlify/Vercel hosting subdomain is not a domain you can verify for sending mail. Do not use the visitor's address, a Gmail address, or Resend's shared test sender as the production From address.
2. Add the domain/subdomain in Resend. Add the exact SPF and DKIM DNS records shown in its dashboard, including its supplied host names and record types. Do not invent DNS values. DMARC can be added according to your domain's mail policy. Wait until Resend shows the sending domain as verified.
3. Choose a sender such as portfolio@your-verified-domain. Create a sending-only Resend API key scoped to that domain where supported. Enter the value only in Vercel's environment settings, never in chat, Git or frontend code.
4. Create a small Upstash Redis database and obtain its REST URL and REST token. This supplies atomic counters across concurrent serverless instances; process-local memory would not enforce a reliable deployment-wide rate limit.
5. Generate a random server-side salt of at least 32 characters. It is used to HMAC the client IP and idempotency payload; only digests are stored as Redis keys. Do not publish this salt.
6. Add the environment variables below to the intended Vercel environment. Keep CONTACT_ENABLED=false until all setup is complete and sending has been authorized. Redeploy after environment changes, with approval.

| Variable | Purpose |
| --- | --- |
| `CONTACT_ENABLED` | Explicit sending switch; only `true` enables the provider path |
| `RESEND_API_KEY` | Private sending API key |
| `CONTACT_FROM_EMAIL` | Plain authorized sender email at the verified domain |
| `CONTACT_ALLOWED_ORIGINS` | Comma-separated exact HTTPS site origins; no paths, trailing slashes or wildcard |
| `UPSTASH_REDIS_REST_URL` | Private Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Private Redis REST token |
| `CONTACT_RATE_LIMIT_SALT` | Private random value of at least 32 characters |

Vercel's trusted `VERCEL_URL` is also accepted as an exact origin for that deployment; it is supplied by the platform. Local preview uses only localhost origins and no provider credentials. The recipient is fixed in server code to sathvidhu@gmail.com. Preview environments can remain disabled until a specific test is approved.

`.env.example` contains placeholders only. `.env`, `.env.*`, `.vercel`, node_modules and dist are ignored; `.env.example` is explicitly allowed. No frontend build step reads secret values.

[Resend domain verification](https://resend.com/docs/dashboard/domains/introduction), [email API](https://resend.com/docs/api-reference/emails/send-email), [idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys), [Upstash REST](https://upstash.com/docs/redis/features/restapi).

## Rate limits and free-tier fit

The implementation permits five validated submission attempts per IP per ten minutes and 40 globally per UTC day. A Redis Lua script increments both counters atomically with expirations. Requests over either limit receive 429; unavailable/misconfigured Redis fails closed with 503. Limits count retries and provider failures as attempts. HMAC IP identifiers expire after ten minutes; daily counters expire after one day. These are basic abuse controls, not a CAPTCHA or protection against a distributed botnet. Configure provider quotas and Vercel's available firewall protection when publishing.

The cap allows at most 40 provider attempts/day and roughly 1,240/month at full utilization, which is below Resend's advertised free email volume. Other projects using the same account also consume its quotas. Upstash has a free Redis tier; heavy bot traffic still consumes Redis commands and Vercel requests. Select the free tiers and verify current quotas in each account before enabling. Vercel Hobby is intended for personal, non-commercial use; confirm the intended use fits the plan. This implementation needs one small Node function and no cron job or paid compute feature.

[Resend pricing](https://resend.com/pricing), [Upstash pricing](https://upstash.com/pricing/redis), [Vercel Hobby](https://vercel.com/docs/plans/hobby), [Vercel plan eligibility](https://vercel.com/pricing).

## Preserve the current Netlify deployment and repositories

The existing netlify.toml still publishes public/. Its form keeps data-netlify, form-name and the honeypot; it continues to POST URL-encoded data to /. Resend is used only by the generated Vercel output. Netlify storage/notification configuration is still managed in Netlify and has not been verified or changed here.

Do not change the existing origin or push merely to set up the second account. A future push to the existing connected branch can trigger Netlify automatically. After reviewing these changes, explicitly approve a commit and choose how to copy the approved revision to a second account/repository. Creating that repository, granting Vercel access and copying the source/history are separate approved steps. A separate clone/check-out can preserve this checkout's existing origin. Avoid transferring .env files or account credentials. No remote-creation or push command has been run for this upgrade.

Current canonical URLs, structured data, sitemap and robots reference the Netlify URL intentionally. Keep those for a secondary mirror, or approve an SEO-domain change once a new primary URL is chosen. Do not point both sites at competing primary URLs inadvertently.

## Authorized production verification procedure

1. Approve the exact target deployment and sender/recipient, and separately approve one test email with a specified harmless payload. Do not send tests until that approval is given.
2. In the approved deployment, verify that /, /about.html, images, CSS and JS return successfully; /api/contact responds as an API rather than homepage HTML. GET should return 405. Check Vercel's deployment output lists the contact function.
3. Confirm secrets are absent from static output and sending is disabled in unapproved preview environments. Check Resend's domain status, the allowed site origin and Redis connectivity in their account dashboards.
4. After sending is authorized, set CONTACT_ENABLED=true for the approved environment and deploy the environment change with approval. Submit exactly the approved message once.
5. A successful API response means Resend returned an email id. Check the provider's event history for delivery, then separately confirm the message in sathvidhu@gmail.com's inbox or spam folder and verify Reply-To. Acceptance alone is not proof of receipt.
6. For an ambiguous timeout, retry the identical message on the same page only after reviewing provider events. The browser retains its submission key for unchanged retries, and Resend deduplicates that key for 24 hours. Reloading the page or editing the message creates a new submission. Do not blindly submit repeated test messages.

Code preparation and mocked tests do not establish provider configuration, Vercel deployment, domain verification or inbox delivery.
