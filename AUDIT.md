# Portfolio audit — 14 November 2026

## Repository verification

Inspected all six public repositories using GitHub metadata, root file listings and READMEs. Checked implementation files for Website, Chatbot, Todo App and Invoice App. None are forks. The profile-only Sathvidhu repository is excluded from the project carousel. Five verified public projects now populate the existing five-card carousel:

| Project | Repository |
| --- | --- |
| Smart Study Planner | https://github.com/Sathvidhu/Mini-Project |
| Invoice App | https://github.com/Sathvidhu/invoice-app |
| Todo App | https://github.com/Sathvidhu/todo-app |
| Local Python Chatbot | https://github.com/Sathvidhu/Chatbot |
| Personal Website | https://github.com/Sathvidhu/Website |

Four newly listed projects replace unverified/private entries; Smart Study Planner is corrected. This replaces the displayed selection, rather than increasing the card count. Previous project data is retained in audit/previous-projects.js, outside the published directory. SeatTreat, Walleto and RJ Ladies Fashion are private; public visitors cannot use their repository links. DriveFlow has no matching public repository. No repository visibility was changed.

All five public repository pages and the GitHub profile returned HTTP 200. No public project homepage/deployment was advertised in repository metadata or verified in the inspected source, so no Live Demo links are shown. The chatbot is explicitly described as an experiment and the older Website as an early portfolio. Study Planner's schema limitations are acknowledged. No genuine application screenshots were available in inspected root listings/READMEs; existing decorative CSS thumbnails are retained rather than represented as screenshots.

## Contact form

The existing message rule rejected fewer than ten trimmed characters with an ambiguous “short message” error. There was no evidence that normal messages of ten or more characters failed this rule. The old local checkout also lacked submission locking and accessible field errors; newer remote commits had partially addressed feedback and loading states.

Required non-whitespace values now validate consistently, including short messages. Email values are trimmed and checked. Fields have required/maxlength attributes, associated error descriptions and aria-invalid state. The first invalid field receives focus; corrected errors clear while typing. A synchronous submission lock, disabled/loading button, timeout and finally cleanup prevent concurrent duplicates. Failed requests preserve input. Timeout feedback acknowledges that the server may already have received the message.

Netlify Forms is retained: static contact form, POST action, form-name=contact, honeypot and URL-encoded AJAX body. netlify.toml explicitly publishes public/. No service keys or credentials are needed in frontend code. HTTP acceptance alone cannot prove inbox delivery or exclude spam classification.

### Required account configuration

1. In the existing Netlify project, enable Forms detection and redeploy if detection was disabled.
2. Confirm that the contact form appears under Forms.
3. Under Forms > Submission notifications, add an email notification for contact to sathvidhu@gmail.com. Complete recipient verification if requested; Netlify may require a team-member address.
4. Submit a live test, confirm the stored record (including spam if needed), and verify the email in the inbox.

References: https://docs.netlify.com/manage/forms/setup/ and https://docs.netlify.com/manage/forms/notifications/ . No authenticated Netlify management session is available here, so detection state, notification configuration, stored records and inbox delivery cannot be confirmed by local tests.

## Interaction and accessibility fixes

Carousel mouse capture now excludes links and buttons; touch uses native scrolling. Arrow handling is restricted to the focused carousel. Filtering resets scroll position. Modal content is inert when closed, traps Tab focus when open, and restores focus on close. External links use noopener noreferrer. Project links require HTTPS; repository URLs additionally require the exact GitHub account/repository path format. Existing dark theme, CSS artwork and animations remain intact.

Newer remote SEO, About page, sitemap, robots, navigation and honeypot changes were incorporated before deployment. The supplied LinkedIn URL is retained; LinkedIn returns HTTP 999 to automated requests, so its profile contents are not independently verified. Email links use the supplied address.

## Validation

This is a buildless static site; there is no application build or dependency install required. JavaScript syntax checks passed. Chromium tests in audit/test_browser.py passed at 1440px and 390px: five cards and matching modal repository links, pointer clicks, focus restoration, no page overflow after viewport settling, empty fields, malformed email, short and normal messages, success/reset, HTTP failure/input preservation, loading cleanup and duplicate prevention. Browser page-error collection was empty. Submission responses in those tests were mocked and do not establish Netlify storage or email delivery.

Screenshots are generated locally under audit/ and ignored by Git. Run tests with an existing Python Playwright installation and Chromium, after serving public/ at http://127.0.0.1:8765. No runtime dependency was added to the portfolio.

## Deployment

The existing origin is Sathvidhu/sathvidhu-portfolio, main branch. Live URL: https://aj-sath.netlify.app/ . See the final task report for the actual push/deployment and live submission result. Account-side email notification setup remains required unless independently confirmed in Netlify.

Deployment verified: commit d50c9b9 was pushed to existing main; production homepage, app.js, projects.js, About page, CSS and logo returned HTTP 200. New validation/project markers were found in production responses. Live test submission was not sent: automatic approval review rejected sending the contact payload to production without exact-payload approval. Stored submissions and email receipt remain unverified.
