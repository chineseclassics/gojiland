# GojiLand

GojiLand is a family-managed home for educational apps created by Goji.

Each app is an independent Cloudflare Worker project under `apps/`. Apps have
their own dependencies, lockfile, build, deployment, and Cloudflare bindings.

## Projects

- `apps/platform`: the GojiLand homepage and app catalogue
- `apps/mystery-number-box`: the first migrated app, originally published as
  `apps/caishuzi` in the Taixu repository

## Local development

```bash
npm --prefix apps/platform install
npm --prefix apps/platform run dev

npm --prefix apps/mystery-number-box install
npm --prefix apps/mystery-number-box run dev
```

## Validation

```bash
npm run build
```

## Deployment

Each app is connected to Cloudflare Workers Builds separately. See
`docs/ARCHITECTURE.md` for the intended build settings and future `goji.land`
custom domains.

