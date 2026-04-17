#!/usr/bin/env node
/**
 * db-push.js
 * Loads .env.local into the environment, then runs `supabase db push`
 * against the linked remote project (no Docker required).
 *
 * Usage:  npm run db:push
 *
 * Required in .env.local:
 *   SUPABASE_DB_PASSWORD=<your-database-password>
 *   (Dashboard → Project Settings → Database → Database password)
 */

const { readFileSync, existsSync } = require('fs')
const { execSync } = require('child_process')

const ENV_FILE = '.env.local'

if (existsSync(ENV_FILE)) {
  const lines = readFileSync(ENV_FILE, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    // Never overwrite vars already set in the shell
    if (!(key in process.env)) process.env[key] = val
  }
} else {
  console.warn(`⚠️  ${ENV_FILE} not found — make sure SUPABASE_DB_PASSWORD is set in your shell.`)
}

if (!process.env.SUPABASE_DB_PASSWORD) {
  console.error(
    '❌  SUPABASE_DB_PASSWORD is not set.\n' +
    '    Add it to .env.local:\n\n' +
    '    SUPABASE_DB_PASSWORD=<your-database-password>\n\n' +
    '    Find it in: Supabase Dashboard → Project Settings → Database\n'
  )
  process.exit(1)
}

console.log('🚀  Pushing migrations to remote Supabase project…\n')

try {
  execSync('npx supabase db push', { stdio: 'inherit', env: process.env })
} catch {
  process.exit(1)
}
