# Sathvidhu A J — Developer Portfolio

Local Vercel preparation is documented in [VERCEL-SETUP.md](VERCEL-SETUP.md); implementation and test results are in [UPGRADE-REPORT.md](UPGRADE-REPORT.md). Run `npm run dev` for a safe Vercel-style preview at http://127.0.0.1:8766/ with real email sending disabled. The existing Netlify source path remains `public/`.

Personal portfolio website of **Sathvidhu A J**, a BCA student and aspiring Frontend Developer. The site introduces my developer journey, highlights selected projects and technologies, and provides ways to connect with me.

🌐 **Approved primary URL (production not verified locally):** https://sathvidhu-portfolio.vercel.app/

## About this project

I built this portfolio to create a central place for my work and professional identity. It is designed as a lightweight, responsive static website with a dark visual style, interactive project showcase and contact section.

The project includes:
- Homepage with an introduction and portfolio navigation
- Dedicated About page at [`/about.html`](https://sathvidhu-portfolio.vercel.app/about.html)
- Technology stack and selected project sections
- Project detail modal and category filtering
- Vercel contact API with Resend delivery and distributed Redis rate limiting; Netlify Forms remains legacy-only
- Search metadata, canonical URLs and social-sharing metadata
- Person/ProfilePage structured data and an XML sitemap

## Tech stack

- **Structure:** HTML5
- **Styling:** CSS3
- **Interactions:** Vanilla JavaScript
- **Hosting / form handling:** Vercel / Node.js contact API (Netlify is legacy/secondary)
- **Version control:** Git and GitHub

## Repository structure

```text
sathvidhu-portfolio/
├── public/
│   ├── index.html       # Portfolio homepage
│   ├── about.html       # Dedicated biography and profile page
│   ├── app.js           # Homepage interactions
│   ├── projects.js      # Project content and data
│   ├── theme.css        # Shared site styling
│   ├── robots.txt       # Search crawler instructions
│   ├── sitemap.xml      # Public page sitemap
│   └── sathvidhu-logo.png
└── README.md
```

## Run locally

Use Node.js 24. There are no npm dependencies to install.

```powershell
npm.cmd run check
npm.cmd test
npm.cmd run build
npm.cmd run dev
```

The local Vercel-style preview runs at http://127.0.0.1:8766/ and deliberately disables real email and Redis calls. The build validates an exact public asset list, creates fresh `dist/` output and preserves previous output in unique `.dist-backup-*/dist` directories beside it. Failed builds clean only their own generated staging files and attempt to restore the previous output. Backups are ignored by Git and never published. Review backups manually; they are not automatically deleted.

## Deployment and contact

Vercel is primary at the approved URL https://sathvidhu-portfolio.vercel.app/. It builds `dist/` using `node scripts/build-vercel.cjs`; `api/contact.js` remains a separate serverless function. See [VERCEL-SETUP.md](VERCEL-SETUP.md) for account configuration and separately authorized production verification.

Production contact requires `CONTACT_ENABLED`, `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_ALLOWED_ORIGINS`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` and `CONTACT_RATE_LIMIT_SALT`. Credentials belong only in hosting environment settings. The sender needs a verified sending domain. Missing or disabled configuration returns 503; the local preview never sends email. Local mocked tests establish behavior, not provider acceptance or inbox delivery.

Netlify is legacy/secondary and still publishes `public/` with Netlify Forms. Netlify notification configuration is independent of the Vercel API. No legacy redirects or shared noindex directives have been applied. A connected-branch push can trigger hosting builds and requires separate approval.

Local validation covers Node tests, production output and Chromium interactions, including disabled JavaScript and SEO. It does not verify the deployed hostname, Vercel packaging, Redis concurrency or email delivery. Without JavaScript, project summaries and content remain readable; the mobile menu requires JavaScript. Reveal effects time out after four seconds to avoid permanently hidden content.

## Search visibility

The site includes:
- Descriptive page titles and meta descriptions
- Canonical URLs for the homepage and About page
- Open Graph and Twitter summary metadata
- Schema.org `ProfilePage` and `Person` JSON-LD
- `robots.txt` and `sitemap.xml`

Search engines decide independently when and how pages are indexed. After deployment, the sitemap can be submitted through [Google Search Console](https://search.google.com/search-console).

## Connect

- **Portfolio:** https://sathvidhu-portfolio.vercel.app/
- **GitHub:** https://github.com/Sathvidhu
- **LinkedIn:** https://www.linkedin.com/in/sathvidhu-a-j-3b9055402/
- **Instagram:** https://www.instagram.com/meet_sath/

---

Made and maintained by **Sathvidhu A J**.
