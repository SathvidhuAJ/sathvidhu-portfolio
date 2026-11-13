# Sathvidhu A J — Developer Portfolio

Local Vercel preparation is documented in [VERCEL-SETUP.md](VERCEL-SETUP.md); implementation and test results are in [UPGRADE-REPORT.md](UPGRADE-REPORT.md). Run `npm run dev` for a safe Vercel-style preview at http://127.0.0.1:8766/ with real email sending disabled. The existing Netlify source path remains `public/`.

Personal portfolio website of **Sathvidhu A J**, a BCA student and aspiring Frontend Developer. The site introduces my developer journey, highlights selected projects and technologies, and provides ways to connect with me.

🌐 **Live portfolio:** https://aj-sath.netlify.app/

## About this project

I built this portfolio to create a central place for my work and professional identity. It is designed as a lightweight, responsive static website with a dark visual style, interactive project showcase and contact section.

The project includes:
- Homepage with an introduction and portfolio navigation
- Dedicated About page at [`/about.html`](https://aj-sath.netlify.app/about.html)
- Technology stack and selected project sections
- Project detail modal and category filtering
- Contact form configured for Netlify Forms
- Search metadata, canonical URLs and social-sharing metadata
- Person/ProfilePage structured data and an XML sitemap

## Tech stack

- **Structure:** HTML5
- **Styling:** CSS3
- **Interactions:** Vanilla JavaScript
- **Hosting / form handling:** Netlify
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

This is a static website and does not require a build step.

1. Clone the repository:
   ```bash
   git clone https://github.com/Sathvidhu/sathvidhu-portfolio.git
   cd sathvidhu-portfolio
   ```
2. Serve the `public` directory using any static server. For example:
   ```bash
   npx serve public
   ```
3. Open the local URL printed by the server.

You can also open `public/index.html` directly, though using a local server is recommended for a deployment-like preview.

## Deployment

The live site is hosted on Netlify. The published files are in the `public/` directory. Configure the Netlify publish directory as `public` (with no build command) if setting up a new deployment.

When the connected Git repository is updated, Netlify can publish the new version automatically according to the site's deploy settings.

## Contact form email notifications

The contact form uses Netlify Forms and submits the visitor's name, email address, subject and message. To receive those submissions by email, enable a form notification in the Netlify site dashboard:

1. Open the site in Netlify and go to **Site configuration** (or **Project configuration**) → **Notifications**.
2. Find **Form submission notifications** and add an **Email notification**.
3. Enter the inbox that should receive contact messages and select the `contact` form.
4. Save the notification and send a test submission from the live website.

Netlify Forms stores submissions in the site's Forms area. Email delivery is controlled by the Netlify notification setting and cannot be enabled by a Git commit alone.

## Search visibility

The site includes:
- Descriptive page titles and meta descriptions
- Canonical URLs for the homepage and About page
- Open Graph and Twitter summary metadata
- Schema.org `ProfilePage` and `Person` JSON-LD
- `robots.txt` and `sitemap.xml`

Search engines decide independently when and how pages are indexed. After deployment, the sitemap can be submitted through [Google Search Console](https://search.google.com/search-console).

## Connect

- **Portfolio:** https://aj-sath.netlify.app/
- **GitHub:** https://github.com/Sathvidhu
- **LinkedIn:** https://www.linkedin.com/in/sathvidhu-a-j-3b9055402/
- **Instagram:** https://www.instagram.com/meet_sath/

---

Made and maintained by **Sathvidhu A J**.
