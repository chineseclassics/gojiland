/**
 * Pack a GojiLand app so it can live at https://goji.land/<app>/.
 *
 * Run from apps/<app> (`npm run build:worker`). Reads Vite `base`, builds the
 * app, then nests `dist/` under `.worker-dist/<prefix>/` so Workers Assets
 * match the public URL. A copy of index.html sits at the asset root for SPA
 * fallbacks on workers.dev.
 */
import { execSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { basename, resolve } from 'node:path'

const cwd = process.cwd()
const app = basename(cwd)
const run = (cmd) => execSync(cmd, { stdio: 'inherit', cwd })

let base = `/${app}/`
for (const file of ['vite.config.ts', 'vite.config.js', 'vite.config.mjs']) {
  const path = resolve(cwd, file)
  if (!existsSync(path)) continue
  const source = readFileSync(path, 'utf8')
  const buildBase = source.match(/base:\s*command\s*={2,3}\s*['"]build['"]\s*\?\s*['"]([^'"]+)['"]/)
  const staticBase = source.match(/base:\s*['"]([^'"]+)['"]/)
  const match = buildBase || staticBase
  if (match) base = match[1].endsWith('/') ? match[1] : `${match[1]}/`
  break
}

const prefix = base.replace(/^\/|\/$/g, '')
if (!prefix) {
  throw new Error(`${app}: production base must be a path prefix such as /${app}/`)
}

run('npm run build')

const dist = resolve(cwd, 'dist')
const out = resolve(cwd, '.worker-dist')
if (!existsSync(dist)) {
  throw new Error(`${app}: dist/ missing after build`)
}

rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })
const nested = resolve(out, prefix)
cpSync(dist, nested, { recursive: true })

const nestedIndex = resolve(nested, 'index.html')
if (existsSync(nestedIndex)) {
  cpSync(nestedIndex, resolve(out, 'index.html'))
}

console.log(`✓ ${app} worker assets ready at .worker-dist/ (base=${base})`)
