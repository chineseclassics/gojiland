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
| Root directory | `/` |
| Build command | `npm --prefix apps/platform install && npm --prefix apps/platform run build` |
| Deploy command | `npx wrangler deploy --cwd apps/platform` |
| Watch paths | `apps/platform/**`, `catalog/**`, `scripts/**` |

### Mystery Number Box

| Setting | Value |
| --- | --- |
| Root directory | `/apps/mystery-number-box` |
| Build command | `npm install && npm run build` |
| Deploy command | `npx wrangler deploy` |
| Watch paths | `apps/mystery-number-box/**` |

Connect Git is a one-time Cloudflare Dashboard operation for each Worker.

## Domains

Before purchasing the domain, Workers deploy to their generated `workers.dev`
addresses. After `goji.land` is active:

- `goji.land` -> `gojiland-platform`
- `mystery-number-box.goji.land` -> `gojiland-mystery-number-box`

Use Cloudflare Custom Domains. Do not create routes under `taixu.app`.

Current preview URLs:

- `https://gojiland-platform.gnoluy.workers.dev`
- `https://gojiland-mystery-number-box.gnoluy.workers.dev`

## Data

The first release has no backend database. Mystery Number Box stores progress
in the player's own browser. Future apps receive separate storage by default;
sharing a database requires a documented platform-level reason.
