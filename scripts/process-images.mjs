#!/usr/bin/env node
import sharp from 'sharp'
import fs from 'node:fs/promises'
import path from 'node:path'
import url from 'node:url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SRC_DIR = path.join(ROOT, 'images')
const DEST_DIR = path.join(ROOT, 'images-processed')
const SUPPORTED_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp'])

const MAX_DIMENSION = 1200
const JPEG_QUALITY = 82

function titleCaseWord(word) {
  if (/^[A-Z][A-Z0-9]+$/.test(word)) return word
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

function cleanStem(stem) {
  return stem
    .replace(/jpe?g|png|webp/gi, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map(titleCaseWord)
    .join(' ')
}

async function safeStat(p) {
  try {
    return await fs.stat(p)
  } catch {
    return null
  }
}

async function processCategory(category, srcSubDir, destSubDir) {
  await fs.mkdir(destSubDir, { recursive: true })

  const allFiles = await fs.readdir(srcSubDir)
  const inputs = allFiles.filter((f) => SUPPORTED_EXTS.has(path.extname(f).toLowerCase()))

  const targets = new Map()
  for (const file of inputs) {
    const stem = path.parse(file).name
    const cleaned = cleanStem(stem)
    if (!cleaned) {
      console.warn(`  [${category}] skip: "${file}" → empty name after cleaning`)
      continue
    }
    const targetName = `${cleaned}.jpg`
    if (targets.has(targetName)) {
      const existing = targets.get(targetName)
      console.error(
        `[${category}] Name collision: "${file}" and "${existing}" both produce "${targetName}". ` +
          `Rename one in images/${category}/ and re-run.`,
      )
      process.exit(1)
    }
    targets.set(targetName, file)
  }

  // Build a case-insensitive lookup of existing dest filenames. Needed so that
  // recasing (e.g. "Oyt Foo.jpg" → "OYT Foo.jpg") takes effect in a single pass
  // on case-insensitive filesystems (default macOS APFS).
  const destActualByLower = new Map()
  for (const name of await fs.readdir(destSubDir)) {
    destActualByLower.set(name.toLowerCase(), name)
  }

  let processed = 0
  let skipped = 0
  let renamed = 0
  for (const [targetName, srcName] of targets) {
    const srcPath = path.join(srcSubDir, srcName)
    const destPath = path.join(destSubDir, targetName)
    const existingActual = destActualByLower.get(targetName.toLowerCase())

    if (existingActual === targetName) {
      const [srcInfo, destInfo] = await Promise.all([safeStat(srcPath), safeStat(destPath)])
      if (destInfo && srcInfo && destInfo.mtimeMs >= srcInfo.mtimeMs) {
        skipped++
        continue
      }
    } else if (existingActual) {
      await fs.unlink(path.join(destSubDir, existingActual))
      destActualByLower.delete(targetName.toLowerCase())
      renamed++
      console.log(`  [${category}] ↻ recasing ${existingActual} → ${targetName}`)
    }

    try {
      await sharp(srcPath)
        .rotate()
        .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: JPEG_QUALITY })
        .toFile(destPath)
      processed++
      console.log(`  [${category}] ✓ ${srcName} → ${targetName}`)
    } catch (err) {
      console.error(`  [${category}] ✗ ${srcName}: ${err.message}`)
      process.exit(1)
    }
  }

  const existingDestFiles = await fs.readdir(destSubDir)
  let removed = 0
  for (const file of existingDestFiles) {
    if (!targets.has(file)) {
      await fs.unlink(path.join(destSubDir, file))
      console.log(`  [${category}] − removed orphan ${file}`)
      removed++
    }
  }

  return { processed, skipped, renamed, removed, total: targets.size }
}

async function main() {
  const srcStat = await safeStat(SRC_DIR)
  if (!srcStat || !srcStat.isDirectory()) {
    console.error(`Source folder not found: ${SRC_DIR}`)
    process.exit(1)
  }

  await fs.mkdir(DEST_DIR, { recursive: true })

  const entries = await fs.readdir(SRC_DIR, { withFileTypes: true })
  const categories = []
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue
    if (entry.isDirectory()) {
      categories.push(entry.name)
    } else if (entry.isFile() && SUPPORTED_EXTS.has(path.extname(entry.name).toLowerCase())) {
      console.warn(
        `  ⚠ skip: "images/${entry.name}" is at the root, not inside a category folder. ` +
          `Move it into images/<category>/ to include it.`,
      )
    }
  }

  if (categories.length === 0) {
    console.error('No category subfolders found in images/. Expected e.g. images/fish/.')
    process.exit(1)
  }

  const totals = { processed: 0, skipped: 0, renamed: 0, removed: 0, total: 0 }
  for (const category of categories) {
    const srcSubDir = path.join(SRC_DIR, category)
    const destSubDir = path.join(DEST_DIR, category)
    const stats = await processCategory(category, srcSubDir, destSubDir)
    for (const k of Object.keys(totals)) totals[k] += stats[k]
  }

  // Remove orphan category folders from dest (categories that no longer exist in src).
  const destEntries = await fs.readdir(DEST_DIR, { withFileTypes: true })
  for (const entry of destEntries) {
    if (entry.isDirectory() && !categories.includes(entry.name)) {
      await fs.rm(path.join(DEST_DIR, entry.name), { recursive: true, force: true })
      console.log(`  − removed orphan category ${entry.name}/`)
    }
  }

  console.log(
    `\nDone. processed=${totals.processed} skipped=${totals.skipped} recased=${totals.renamed} removed=${totals.removed} total=${totals.total} (across ${categories.length} categor${categories.length === 1 ? 'y' : 'ies'})`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
