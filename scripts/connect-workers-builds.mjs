/**
 * Connect GojiLand Workers to Cloudflare Workers Builds.
 *
 * Needs:
 *   CLOUDFLARE_API_TOKEN   user token with Workers Builds Configuration Edit
 *   CLOUDFLARE_ACCOUNT_ID  wrangler whoami
 *
 * Usage:
 *   node scripts/connect-workers-builds.mjs --audit
 *   node scripts/connect-workers-builds.mjs --all
 *   node scripts/connect-workers-builds.mjs typing-island fruit-crossing
 */
import { existsSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const TOKEN = process.env.CLOUDFLARE_API_TOKEN
const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID
if (!TOKEN || !ACCOUNT) {
  console.error('Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID first.')
  process.exit(1)
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const API = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}`
const headers = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }

async function cf(path, init = {}) {
  const res = await fetch(`${API}${path}`, { ...init, headers })
  const data = await res.json()
  if (!data.success) {
    throw new Error(`${init.method ?? 'GET'} ${path} failed: ${JSON.stringify(data.errors)}`)
  }
  return data.result
}

function workerName(app) {
  return `gojiland-${app}`
}

function settingsFor(app) {
  const appWatch = `apps/${app}/**`
  if (app === 'platform') {
    return {
      build_command: 'npm install && npm run build',
      deploy_command: 'npx wrangler deploy',
      preview_deploy_command: 'npx wrangler versions upload',
      root_directory: '/apps/platform',
      path_includes: [appWatch, 'catalog/**', 'scripts/**'],
    }
  }
  return {
    build_command: 'npm install && npm run build:worker',
    deploy_command: 'npx wrangler deploy',
    preview_deploy_command: 'npx wrangler versions upload',
    root_directory: `/apps/${app}`,
    path_includes: [appWatch, 'scripts/**'],
  }
}

const apps = readdirSync(resolve(repoRoot, 'apps')).filter((name) =>
  existsSync(resolve(repoRoot, 'apps', name, 'wrangler.jsonc')),
)

const scripts = await cf('/workers/scripts')
const tagByName = new Map(scripts.map((s) => [s.id, s.tag]))

async function triggersOf(tag) {
  try {
    return await cf(`/builds/workers/${tag}/triggers`)
  } catch {
    return []
  }
}

const status = []
for (const app of apps) {
  const name = workerName(app)
  const tag = tagByName.get(name)
  if (!tag) {
    status.push({ app, name, state: 'worker missing (deploy once first)' })
    continue
  }
  const triggers = await triggersOf(tag)
  status.push({
    app,
    name,
    tag,
    triggers,
    state: triggers.length ? `connected (${triggers.length} trigger${triggers.length === 1 ? '' : 's'})` : 'not connected',
  })
}

const missing = status.filter((s) => s.state === 'not connected')
console.log('=== GojiLand Workers Builds ===')
for (const s of status) console.log(`${s.app.padEnd(24)} ${s.name.padEnd(32)} ${s.state}`)
console.log(`\n${apps.length} apps, ${missing.length} without CI`)

const args = process.argv.slice(2)
if (args.includes('--audit') || args.length === 0) process.exit(0)

const targets = args.includes('--all')
  ? status.filter((s) => s.tag).map((s) => s.app)
  : args.filter((a) => !a.startsWith('--'))

if (!targets.length) {
  console.log('Nothing to connect.')
  process.exit(0)
}

let repoConnectionUuid = null
for (const s of status) {
  const withConn = s.triggers?.find((t) => t.repo_connection_uuid)
  if (withConn) {
    repoConnectionUuid = withConn.repo_connection_uuid
    console.log(`\nReusing Git connection from ${s.app}: ${repoConnectionUuid}`)
    break
  }
}
if (!repoConnectionUuid) {
  console.error(
    'No existing repo connection. Connect Git once in the dashboard for gojiland-platform, then rerun.',
  )
  process.exit(1)
}

const tokens = await cf('/builds/tokens')
const buildToken = tokens[0]
if (!buildToken) {
  console.error('No build token on this account. Create one in any Worker Builds settings first.')
  process.exit(1)
}
console.log(`Using build token: ${buildToken.build_token_name ?? buildToken.build_token_uuid}`)

for (const app of targets) {
  const name = workerName(app)
  const tag = tagByName.get(name)
  if (!tag) {
    console.error(`Skip ${app}: worker ${name} is not deployed`)
    continue
  }
  const existing = await triggersOf(tag)
  const wanted = settingsFor(app)
  if (existing.length) {
    for (const trigger of existing) {
      const isPreview = (trigger.branch_excludes || []).includes('main')
      await cf(`/builds/triggers/${trigger.trigger_uuid}`, {
        method: 'PATCH',
        body: JSON.stringify({
          build_command: wanted.build_command,
          deploy_command: isPreview ? wanted.preview_deploy_command : wanted.deploy_command,
          root_directory: wanted.root_directory,
          path_includes: wanted.path_includes,
          path_excludes: [],
        }),
      })
    }
    console.log(`Updated ${app} (${existing.length} trigger${existing.length === 1 ? '' : 's'})`)
    continue
  }

  const base = {
    external_script_id: tag,
    repo_connection_uuid: repoConnectionUuid,
    build_token_uuid: buildToken.build_token_uuid,
    build_command: wanted.build_command,
    root_directory: wanted.root_directory,
    path_includes: wanted.path_includes,
    path_excludes: [],
  }
  const prod = await cf('/builds/triggers', {
    method: 'POST',
    body: JSON.stringify({
      ...base,
      trigger_name: 'Deploy production',
      deploy_command: wanted.deploy_command,
      branch_includes: ['main'],
      branch_excludes: [],
    }),
  })
  await cf('/builds/triggers', {
    method: 'POST',
    body: JSON.stringify({
      ...base,
      trigger_name: 'Deploy non-production branches',
      deploy_command: wanted.preview_deploy_command,
      branch_includes: ['*'],
      branch_excludes: ['main'],
    }),
  })
  console.log(`Connected ${app} (production ${prod.trigger_uuid ?? ''} + preview)`)
}
