# Deploying HouseBank's frontend

This is a Vite/React SPA. There's no Node process for this half —
`npm run build` produces a static `dist/` folder that cPanel serves as
plain files (Apache/LiteSpeed), same as any HTML site. The backend
(`hb-backend`) is a separate Node app — see its own `docs/DEPLOYMENT.md`.

## Vercel deployment

The checked-in production build uses the same-origin `/api/` path. `vercel.json`
rewrites `/api/*` to the backend, so auth cookies remain first-party and the
browser does not need to allow third-party cookies. Update the rewrite target
there if the backend hostname changes.

## Namecheap/cPanel static deployment

For a static host without an API rewrite, override the build-time API URL with
the public backend URL. Create `.env.production.local` (git-ignored) in this
folder before building:

```
VITE_APP_BACKEND_HOST=https://housebank-backend-j5a6.onrender.com/
```

The trailing slash is required because endpoint paths are appended directly.
If builds happen in the hosting provider, set the same value in its build
environment. Since the API is cross-origin in this deployment, verify browser
cookie support and configure the backend's `FRONTEND_URL` for the exact site
origin.

## 1. Build

```
npm install
npm run build
```

Output is `dist/` — everything inside it is what gets uploaded, the
`dist` folder name itself doesn't matter to the server.

This also bundles `public/.htaccess` (already in this repo) into
`dist/.htaccess` automatically — that file is what makes React Router's
client-side routes (e.g. a direct visit or refresh on `/explore` or
`/agent/dashboard`) work on Apache instead of 404ing. Confirm it's
present after the build:

```
ls -la dist/.htaccess
```

## 2. Create where it lives in cPanel

Decide the domain/subdomain this frontend will answer on (e.g. your
main domain, or a `test.yourdomain.com` subdomain while you're
verifying features first) — cPanel → **Domains** (or **Subdomains**) →
create it if it doesn't exist yet, and note the **document root** cPanel
assigns it (often `public_html` for the main domain, or
`public_html/test` for a subdomain).

## 3. Upload

Upload the **contents** of `dist/` (not the `dist` folder itself) into
that document root, via cPanel **File Manager** or SFTP:

```
public_html/
├── .htaccess
├── index.html
├── favicon.png
├── og-image.png
├── robots.txt
├── sitemap.xml
└── assets/
    └── ...
```

If the document root already has a placeholder `index.html` or a
default cPanel page, remove it first so it doesn't collide.

## 4. Before this becomes the real production domain

`public/robots.txt` and `public/sitemap.xml` (source files, copied
verbatim into every `dist/`) both still contain the placeholder
`https://YOUR-DOMAIN-HERE`. Replace it with your real domain and rebuild
before this goes live for real — harmless while you're just testing on
a subdomain, but wrong URLs in a sitemap you submit to Google are worse
than no sitemap.

## 5. Verify

- Visit the domain — the homepage should load.
- Manually type a deep URL in the address bar (not a link click), e.g.
  `https://yourdomain.com/explore`, and refresh it. If you get an Apache
  404 instead of the app, `.htaccess` didn't upload or `mod_rewrite`
  isn't enabled on your hosting plan (contact Namecheap support for the
  latter — it's standard on shared hosting but occasionally needs
  enabling).
- Open the browser console on any page that hits the API (e.g. sign in)
  and confirm requests go to `https://api.yourdomain.com/...`, not
  `localhost`. If you see `localhost:3001`, step 0 was skipped or
  `.env.production.local` has a typo — rebuild.
- Confirm CORS works end to end: a failed request that never reaches
  the Network tab with a response, only a CORS error in the console,
  means the backend's `FRONTEND_URL` env var (backend `docs/DEPLOYMENT.md`
  step 4) doesn't match this domain exactly (scheme + host, no trailing
  slash mismatch).

## Redeploying later

Same three commands — rebuild, then re-upload `dist/`'s contents over
the old ones. `.htaccess` ships with every build automatically since
it's fixed in `public/`, so you won't lose it.
