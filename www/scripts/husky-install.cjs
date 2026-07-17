const { existsSync } = require('node:fs')
const { spawnSync } = require('node:child_process')
const { join } = require('node:path')

const repoRoot = join(__dirname, '..', '..')
const gitDir = join(repoRoot, '.git')

// Image builds and other non-git contexts should skip hook setup.
if (!existsSync(gitDir)) {
  process.exit(0)
}

const huskyBin = join(__dirname, '..', 'node_modules', '.bin', 'husky')
const result = spawnSync(huskyBin, ['install', 'www/.husky'], {
  cwd: repoRoot,
  stdio: 'inherit',
})

process.exit(result.status ?? 1)
