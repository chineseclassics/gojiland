# GojiLand Architecture

## Decision

GojiLand starts directly with the independent Worker architecture that Taixu
reached after its B3 migration. It does not use a shared Pages build, a root
`build-all.sh`, copied Functions, or a shared root Wrangler configuration.

```text
GitHub repository
├── catalog/apps.json
├── apps/platform             -> gojiland-platform Worker
├── apps/mystery-number-box   -> gojiland-mystery-number-box Worker
├── apps/rollance             -> gojiland-rollance Worker
├── apps/fruit-crossing       -> gojiland-fruit-crossing Worker
├── apps/typing-island        -> gojiland-typing-island Worker
├── apps/bakers               -> gojiland-bakers Worker
└── future apps               -> one Worker per app
```

## App contract

Every app owns:

- `package.json` and `package-lock.json`
- `vite.config.ts`
- `wrangler.jsonc`
- frontend source and public assets
- optional Worker API source
- optional app-specific D1, R2, KV, or Durable Object bindings

Apps must not import source code from another app. A small shared package may be
introduced later only when real duplication justifies it.

## Cloudflare Workers Builds

### Platform

| Setting | Value |
| --- | --- |
| Root directory | `/apps/platform` |
| Build command | `npm install && npm run build` |
| Deploy command | `npx wrangler deploy` |
| Watch paths | `apps/platform/**`, `catalog/**`, `scripts/**` |

### Mystery Number Box

| Setting | Value |
| --- | --- |
| Root directory | `/apps/mystery-number-box` |
| Build command | `npm install && npm run build:worker` |
| Deploy command | `npx wrangler deploy` |
| Watch paths | `apps/mystery-number-box/**`, `scripts/**` |

### Rollance

| Setting | Value |
| --- | --- |
| Root directory | `/apps/rollance` |
| Build command | `npm install && npm run build:worker` |
| Deploy command | `npx wrangler deploy` |
| Watch paths | `apps/rollance/**`, `scripts/**` |

### Fruit Crossing

| Setting | Value |
| --- | --- |
| Root directory | `/apps/fruit-crossing` |
| Build command | `npm install && npm run build:worker` |
| Deploy command | `npx wrangler deploy` |
| Watch paths | `apps/fruit-crossing/**`, `scripts/**` |

### Typing Island

| Setting | Value |
| --- | --- |
| Root directory | `/apps/typing-island` |
| Build command | `npm install && npm run build:worker` |
| Deploy command | `npx wrangler deploy` |
| Watch paths | `apps/typing-island/**`, `scripts/**` |

### Bakers

| Setting | Value |
| --- | --- |
| Root directory | `/apps/bakers` |
| Build command | `npm install && npm run build:worker` |
| Deploy command | `npx wrangler deploy` |
| Watch paths | `apps/bakers/**`, `scripts/**` |

Connect Git once on `gojiland-platform`, then run:

```bash
CLOUDFLARE_API_TOKEN=<Workers Builds Configuration Edit> \
CLOUDFLARE_ACCOUNT_ID=c6c526daf65c22f6ab0fe6c93f86f160 \
node scripts/connect-workers-builds.mjs --all
```

Apps watch `scripts/*` because they share `scripts/build-worker.mjs`. Each app also needs `apps/<app>/.npmrc` with `include=dev`, or Workers Builds will skip Vite and Wrangler.

## Domains

Public URLs share one hostname. Each app is still an independent Worker; more
specific path routes win over the platform catch-all.

- `goji.land/*` and `www.goji.land/*` -> `gojiland-platform`
- `goji.land/mystery-number-box*` -> `gojiland-mystery-number-box`
- `goji.land/rollance*` -> `gojiland-rollance`
- `goji.land/fruit-crossing*` -> `gojiland-fruit-crossing`
- `goji.land/typing-island*` -> `gojiland-typing-island`
- `goji.land/bakers*` -> `gojiland-bakers`

Use Cloudflare zone routes on `goji.land`. Do not create routes under
`taixu.app`. Do not give each app its own subdomain.

Current production URLs:

- `https://goji.land/`
- `https://goji.land/mystery-number-box/`
- `https://goji.land/rollance/`
- `https://goji.land/fruit-crossing/`
- `https://goji.land/typing-island/`
- `https://goji.land/bakers/`

## Data

The first release has no backend database. Mystery Number Box stores progress
in the player's own browser. Future apps receive separate storage by default;
sharing a database requires a documented platform-level reason.
