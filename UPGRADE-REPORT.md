# Portfolio upgrade report — 14 November 2026

## Status

Code implemented and locally tested. Ready for review before an approved Git commit. Not ready for operational production email: the user confirmed no verified sending domain yet, and no provider/Redis credentials have been configured or tested here. No commit, push, remote change, repository creation, deployment, production form submission or real email was performed during this upgrade.

## Root cause and diagnosis

The original static portfolio has no backend. Its Netlify form posts to / using URL-encoded data. An empty, localhost-only POST to the original Python static server returned HTTP 501, confirming it cannot process that method. Vercel likewise cannot supply Netlify's form-processing service from form attributes. The error is the generic response to a failed or unconfirmed request, not evidence of invalid form text. Netlify production storage, notification settings and delivery have NOT BEEN TESTED in this task because production submissions were not authorized. Do not infer that its configured Netlify integration is broken from a local failure.

## Implemented email path

Generated Vercel HTML → JSON POST /api/contact → server validation and same-origin check → shared Redis rate limit → Resend email API → JSON acceptance response → frontend feedback.

The API fixes the recipient, uses the configured sender and validated Reply-To, sends plain text, enforces field/body limits, rejects unexpected fields/header injection, checks a honeypot, and never logs messages or credentials. Five attempts/IP/ten minutes and 40/day globally use shared atomic Redis counters. Missing configuration or a failed limiter blocks sending. The frontend and provider use idempotency keys to protect pending submissions and unchanged retries. A success response requires provider acceptance with an email id; it does not mean inbox delivery.

The local Node preview intentionally disables provider calls even when real credentials exist in the shell. Node tests inject mocked transports. API deployment configuration lives outside dist/ and there is no SPA catch-all rewrite.

## Project case studies

All five READMEs were fetched again. Relevant implementation files were inspected, and repository metadata confirmed all five public repositories exist, advertise no homepage and have no GitHub Pages deployment. There is no verified Live Demo to display.

| Project | Added verified detail | Sources |
| --- | --- | --- |
| Smart Study Planner | Student/session workflow, weekly timetable, PHP/MySQLi architecture, resource/mock-test pages, local setup and documented schema limitations | [README](https://github.com/Sathvidhu/Mini-Project/blob/main/README.md), student/timetablee.php |
| Invoice App | Client → itemized invoice → status → print workflow; PHP API and relational tables; Docker setup | [README](https://github.com/Sathvidhu/invoice-app/blob/main/README.md), api/invoices.php |
| Todo App | Task CRUD, priorities/dates, filters/statistics, PHP REST API and local setup; recurrence/schema caveat | [README](https://github.com/Sathvidhu/todo-app/blob/main/README.md), api/tasks.php |
| Local Python Chatbot | Pipeline/CLI workflow, model cache, sampling, virtual-environment setup and documented model limitations | [README](https://github.com/Sathvidhu/Chatbot/blob/main/README.md), main.py |
| Personal Website | Static-page workflow, checkbox navigation, Particles.js behavior and static-server setup | [README](https://github.com/Sathvidhu/Website/blob/main/README.md), index.html, app.js |

Personal Website's README is only a heading; its detail comes from source. No application screenshots or documented personal lessons were available to support those sections, so they are omitted. Existing CSS illustrations remain decorative. Project data stays in public/projects.js; the renderer hides empty optional sections and uses textContent for new case-study content.

The close button stays visible during long modal scrolling. Local fixes also address initial modal focus during its visibility transition, stale Escape focus restoration, reduced-motion scrolling and decorative-orbit overflow at 320px. Theme colors, typography declarations, particle effects, carousel layout and other animations are retained.

## Changed and added files

| Area | Files |
| --- | --- |
| Frontend | public/index.html, public/app.js, public/projects.js, public/theme.css |
| Server email | api/contact.js |
| Build/config | package.json, vercel.json, .env.example, .gitignore, scripts/build-vercel.cjs, scripts/check.cjs, scripts/dev-server.cjs |
| Tests | tests/contact.test.cjs, tests/build.test.cjs, audit/local_verify.py, audit/vercel_browser.py |
| Documentation | VERCEL-SETUP.md, UPGRADE-REPORT.md, LOCAL-VERIFICATION.md, README.md |

No runtime npm dependencies were introduced. The existing audit/test_browser.py remains usable against the unchanged Netlify source path. Generated dist/, screenshots, logs and per-run audit/*-results.json outputs are ignored by Git and remain local.

## Commands and results

Commands run from C:\Sath-web\sathvidhu-portfolio:

| Command/check | Result |
| --- | --- |
| `git status --short`, `git branch --show-current`, `git remote -v` | PASS: main; existing origin preserved; all upgrade changes remain uncommitted |
| `npm.cmd run check` | PASS: JS syntax and JSON configuration |
| `npm.cmd test` | PASS: 50 API/build tests; zero failed; external provider calls mocked |
| `npm.cmd run build` | PASS: dist generated; Vercel contact action, Netlify-source preservation, API/static separation and secret-exclusion checks passed |
| `npm.cmd run dev` | PASS: http://127.0.0.1:8766/; local provider sending disabled |
| `python -m http.server 8765 --bind 127.0.0.1 --directory public` | PASS: separate original-source preview at http://127.0.0.1:8765/ |
| `python audit/vercel_browser.py` | PASS: all five long modals at 390/1440px, five viewport widths, close-button scrolling, focus trap/restoration, navigation, validation, JSON endpoint/payload, loading/duplicates, idempotency reuse, acceptance/failure/timeout/offline states; safe localhost API 503, API GET 405, source/.env inaccessible |
| `python audit/local_verify.py` | PASS: Netlify-source regressions, five exact repository hrefs, five viewport widths, mouse/keyboard carousel, modal Tab loop, closed-modal Escape, navigation/filters, About page, reduced-motion CSS/JS, mocked failure/timeout/duplicate handling |
| `python audit/test_browser.py` | PASS: original five-card/modal checks and short/normal/invalid forms, success/failure mocks and duplicate protection |
| `git diff --check` | PASS: no whitespace errors |
| Dedicated lint/type-check | NOT APPLICABLE: no configured linter or typed source; syntax checks run instead |
| Browser runtime exceptions/local failed assets | PASS: none observed |
| Google Fonts loading | NOT VERIFIED: sandbox returned ERR_NETWORK_ACCESS_DENIED for fonts.googleapis.com; fallback fonts worked; existing external font configuration retained |
| Real Resend/Redis connectivity, verified sender/domain | NOT TESTED / NOT CONFIGURED |
| Actual Vercel packaging/routing, physical mobile, Firefox/Safari | NOT TESTED |
| Netlify production submission/provider acceptance/inbox delivery | NOT TESTED; no production form or email sent |

The Node dev server simulates the API entry locally; a successful static build does not prove Vercel's function packaging. Automated tests check labels/errors, focus, keyboard, image alt attributes and overflow but do not constitute a full assistive-technology accessibility audit. GitHub repository resources were read successfully through the connected GitHub tool; browser tests assert each card/modal's exact href rather than navigating away from localhost.

## Before deployment

Follow [VERCEL-SETUP.md](VERCEL-SETUP.md) for exact settings, environment names, domain/SPF/DKIM setup, Redis configuration, second-account workflow and an explicitly authorized production-test procedure. Vercel uses Other, Node 24.x, build command node scripts/build-vercel.cjs, output dist; root api/contact.js is a separate function. No secret values need to be shared in chat.

The Netlify site is untouched. Its source still publishes public/ with Netlify form handling; Vercel builds dist/ with Resend handling. A future push to the currently connected branch can trigger Netlify automatically, so approval is required before any push. Canonical URLs still identify the existing Netlify site until a new primary URL is explicitly selected.

| Delivery stage | Actual state |
| --- | --- |
| Code implemented | YES |
| Locally tested | YES, mocks plus safe disabled local endpoint |
| Provider configured | NO |
| Production deployed by this task | NO |
| Real email accepted by provider | NOT TESTED |
| Real email received in inbox | NOT TESTED |
