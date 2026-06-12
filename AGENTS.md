# GojiLand Development Rules

GojiLand is an independent monorepo for educational apps created by Goji and
managed by her family.

## Boundaries

- This repository is independent from `chineseclassics.github.io`.
- Taixu is an architecture reference only.
- Never read, modify, import, or bind Taixu databases, buckets, secrets, OAuth
  sessions, Worker routes, or production resources from GojiLand code.
- All Cloudflare resource names must begin with `gojiland-`.
- Do not add a route under `taixu.app`.

## Monorepo rules

- Every directory under `apps/` is an independent npm and Cloudflare Worker
  project.
- Run npm, Vite, Wrangler, type checks, and builds from the target app or with
  `npm --prefix apps/<app>`.
- Each app keeps its own `package-lock.json`.
- A failing app must not prevent unrelated apps from deploying.
- Purely static apps should stay purely static. Add D1, R2, KV, or Durable
  Objects only when the product needs them.

## Product rules

- Goji is a child. Infrastructure, domains, publishing, and secrets remain
  under a parent-managed account.
- Public visitors are read-only by default.
- Do not collect children's names, email addresses, photos, voice, precise
  location, school information, or free-form public posts without a separate
  privacy review.
- Do not add public accounts, comments, chat, ratings, analytics trackers, or
  uploads as incidental features.
- Never expose API keys in frontend code.

## Technology

- TypeScript for new code
- Vite for frontend builds
- Cloudflare Workers with Static Assets
- Mobile-first responsive interfaces
- Prefer local assets and dependencies over runtime CDN dependencies

## Deployment

- Worker names use `gojiland-<app>`.
- Initially deploy to `workers.dev`.
- After `goji.land` is purchased:
  - platform: `goji.land`
  - apps: `<app>.goji.land`
- Cloudflare Workers Builds should watch only the app's directory. The platform
  also watches `catalog/**` because it owns the public catalogue.

