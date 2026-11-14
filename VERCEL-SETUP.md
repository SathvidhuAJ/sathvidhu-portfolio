# Vercel hosting and contact drafts

Vercel is primary at the user-approved https://sathvidhu-portfolio.vercel.app/; Netlify is legacy/secondary. Local code is prepared. No account resources, DNS records, Git remotes, repositories or deployments have been created or changed. No real email has been sent. The user confirmed that no verified sending domain is currently available.

## Current contact workflow (Phase 3F)

The frontend uses free email compose, not the retained contact API. Open in Gmail is the sole form action and opens Google's compose URL in a separate tab with the draft contents; login may be required. The visible email-address link remains available for visitors using another configured email client. Visitors review and press Send themselves. Opening a draft never automatically sends email or proves delivery. Name, email, subject and multiline message remain in the form.

No backend credentials or environment changes are required for compose. Keep production CONTACT_ENABLED=false for the unused API; its actual production value was not inspected or changed. Keep the API and related tests until separate cleanup is approved. The legacy configuration below is reference material only and must not be followed to enable sending for this workflow.

The browser cannot reliably detect an installed email handler or whether a noopener Gmail tab opened. Retry links and a selectable complete plain-text draft are kept in compact, expandable draft options. Gmail handoffs above 8,000 URL characters are withheld with manual-copy instructions; these conservative thresholds cannot guarantee every application's limits. Nothing is truncated. Choosing Gmail shares draft contents with Google through its compose URL. No visitor content is logged, stored locally or submitted to this site's API. JavaScript-disabled visitors get a direct email link and disabled draft controls.

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

The Python tests require Python Playwright and its Chromium browser to be installed. They are verification tools, not application runtime dependencies. Email/Gmail handoffs in browser tests are intercepted without launching an email app or contacting Google; the Vercel browser test separately checks the retained disabled localhost API endpoint. Node API tests inject mocked Redis/Resend responses and never call real services.

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

Build safety: staging and uniquely named `.dist-backup-*/dist` backups stay beside `dist/` on the same filesystem. The exact eight-file publish set is validated recursively before replacement. Existing output is retained without merging stale files; backups are never overwritten or automatically deleted. Generated staging is cleaned on ordinary failures, and a failed publish attempts rollback. If the filesystem also rejects rollback, the old output remains in the reported backup and the build fails; manual recovery is required before publishing. Permission failures, external concurrent writers and process termination cannot be made transactional by directory renames. Run only one build per checkout at a time. No system-temporary-directory rename is needed. Staging/backup directories are ignored and excluded from output.

The build copies only the validated public assets to dist/ and verifies the compose marker. Source and generated contact markup are identical; no API/Netlify submission action is added. It does not modify public/. The API remains outside static output, where Vercel's Node function builder detects it. Actual Vercel function packaging/routing must be confirmed in a deployment; the local server is not the Vercel runtime.

[Vercel Node runtime and API routing](https://vercel.com/docs/functions/runtimes/node-js), [build settings](https://vercel.com/docs/builds/configure-a-build), [supported Node versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).

## Legacy API reference: provider and domain setup (unused; do not enable)

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

The existing netlify.toml still publishes public/. Both hosting platforms now use the same client-side compose form with no Netlify Forms metadata or API submission. No Netlify storage or notification setup is needed for compose.

Do not change the existing origin or push merely to set up the second account. A future push to the existing connected branch can trigger Netlify automatically. After reviewing these changes, explicitly approve a commit and choose how to copy the approved revision to a second account/repository. Creating that repository, granting Vercel access and copying the source/history are separate approved steps. A separate clone/check-out can preserve this checkout's existing origin. Avoid transferring .env files or account credentials. No remote-creation or push command has been run for this upgrade.

The user-approved primary URL is https://sathvidhu-portfolio.vercel.app/ (Phase 3C). Canonical URLs, sharing metadata, structured data, sitemap and robots now identify that origin. This is an approved target, not proof of live deployment or domain ownership verified by these local checks.

For the retained, unused API only, CONTACT_ALLOWED_ORIGINS must allow the primary origin exactly, without a trailing slash or path. VERCEL_URL remains platform-provided and permits the deployment hostname; it is not a substitute for configuring stable aliases. No environment values were changed. The API expects same-origin JSON requests and does not grant cross-origin CORS access. Keep all other contact prerequisites above in place.

The legacy Netlify site may continue serving duplicate content until a hosting-specific migration is approved. Recommend a path-preserving permanent redirect from the legacy host to the primary, configured only for Netlify after confirming scope. Do not add shared noindex directives or Vercel redirects. No redirects, DNS, dashboards or indexing directives were changed in this phase. Historical audit reports retain their original Netlify references as historical evidence.

## Legacy API verification reference (not part of compose release)

1. Approve the exact target deployment and sender/recipient, and separately approve one test email with a specified harmless payload. Do not send tests until that approval is given.
2. In the approved deployment, verify that /, /about.html, images, CSS and JS return successfully; /api/contact responds as an API rather than homepage HTML. GET should return 405. Check Vercel's deployment output lists the contact function.
3. Confirm secrets are absent from static output and sending is disabled in unapproved preview environments. Check Resend's domain status, the allowed site origin and Redis connectivity in their account dashboards.
4. After sending is authorized, set CONTACT_ENABLED=true for the approved environment and deploy the environment change with approval. Submit exactly the approved message once.
5. A successful API response means Resend returned an email id. Check the provider's event history for delivery, then separately confirm the message in sathvidhu@gmail.com's inbox or spam folder and verify Reply-To. Acceptance alone is not proof of receipt.
6. For an ambiguous timeout, retry the identical message on the same page only after reviewing provider events. A separate legacy API client would need to retain an idempotency key for unchanged retries; the current compose frontend has no API submission or idempotency key. Do not blindly submit repeated test messages.

Code preparation and mocked tests do not establish provider configuration, Vercel deployment, domain verification or inbox delivery.
