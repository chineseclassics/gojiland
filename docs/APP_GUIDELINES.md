# App Guidelines

## Definition of ready

An app is ready to publish when it:

- works on a small phone and a desktop browser
- has a clear title, description, age range, and subject in `catalog/apps.json`
- has no broken or placeholder controls
- has no runtime dependency on Taixu
- has no frontend secrets
- builds from a clean app-local install
- has a parent-reviewed public description and screenshot

## Naming

- Directory: `kebab-case`
- Worker: `gojiland-<directory>`
- Future domain: `<directory>.goji.land`
- Cloudflare storage: `gojiland-<directory>-<purpose>`

## Publishing flow

1. Goji creates and tests the app.
2. A parent reviews content, privacy, permissions, and external requests.
3. Update the catalogue entry.
4. Push the app commit.
5. Cloudflare builds only that app.
6. Verify the production URL before marking the catalogue entry `published`.

