# Local verification — 14 November 2026

The subsequent requested Vercel/email upgrade is completed locally in [UPGRADE-REPORT.md](UPGRADE-REPORT.md). See that report for current test outcomes and [VERCEL-SETUP.md](VERCEL-SETUP.md) for deployment prerequisites. No commit, push, remote change, deployment or real email was performed.

Initial state: main branch, clean working tree, one existing origin remote. No package.json, package lockfile, npm scripts, framework, server API or Vercel configuration. Netlify publishes public/. No dependency installation required. No Git mutations or deployments authorized.

## Defects reproduced before changes

1. Opening a modal immediately tries to focus its close button while the CSS visibility transition is starting. Chromium retained focus on the project button, and Shift+Tab escaped into the background instead of looping inside the dialog.
2. Escape after closing a modal restores the stale project trigger even when focus is now in the contact form.
3. Navigation/carousel JavaScript explicitly requests smooth scrolling, bypassing the CSS reduced-motion rule. The discovery observer also schedules an animated nudge for reduced-motion users.

Only these interaction/accessibility defects will be changed; styling and visual design will remain intact.

Expanded Vercel-build QA also reproduced intermittent document overflow at 320px when the existing rotating decorative orbit extends past the viewport. Root horizontal clipping contains that decorative effect while preserving the page layout and orbit animation.
