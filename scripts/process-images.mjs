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

async function main() {
  const srcStat = await safeStat(SRC_DIR)
  if (!srcStat || !srcStat.isDirectory()) {
    console.error(`Source folder not found: ${SRC_DIR}`)
    process.exit(1)
  }

  await fs.mkdir(DEST_DIR, { recursive: true })

  const allFiles = await fs.readdir(SRC_DIR)
  const inputs = allFiles.filter((f) => SUPPORTED_EXTS.has(path.extname(f).toLowerCase()))

  const targets = new Map()
  for (const file of inputs) {
    const stem = path.parse(file).name
    const cleaned = cleanStem(stem)
    if (!cleaned) {
      console.warn(`  skip: "${file}" → empty name after cleaning`)
      continue
    }
    const targetName = `${cleaned}.jpg`
    if (targets.has(targetName)) {
      const existing = targets.get(targetName)
      console.error(
        `Name collision: "${file}" and "${existing}" both produce "${targetName}". ` +
          `Rename one in images/ and re-run.`,
      )
      process.exit(1)
    }
    targets.set(targetName, file)
  }

  // Build a case-insensitive lookup of existing dest filenames, retaining the
  // actual on-disk name. Needed so we behave correctly on case-insensitive
  // filesystems (default macOS APFS): e.g. "OYT Foo.jpg" and "Oyt Foo.jpg"
  // collide on disk, but our targets map is case-sensitive.
  const destActualByLower = new Map()
  for (const name of await fs.readdir(DEST_DIR)) {
    destActualByLower.set(name.toLowerCase(), name)
  }

  let processed = 0
  let skipped = 0
  let renamed = 0
  for (const [targetName, srcName] of targets) {
    const srcPath = path.join(SRC_DIR, srcName)
    const destPath = path.join(DEST_DIR, targetName)
    const existingActual = destActualByLower.get(targetName.toLowerCase())

    if (existingActual === targetName) {
      const [srcInfo, destInfo] = await Promise.all([safeStat(srcPath), safeStat(destPath)])
      if (destInfo && srcInfo && destInfo.mtimeMs >= srcInfo.mtimeMs) {
        skipped++
        continue
      }
    } else if (existingActual) {
      // Case-different version on disk. Remove it explicitly so the new write
      // takes the desired case (case-insensitive FS would otherwise preserve
      // the old name and silently drop the rename).
      await fs.unlink(path.join(DEST_DIR, existingActual))
      destActualByLower.delete(targetName.toLowerCase())
      renamed++
      console.log(`  ↻ recasing ${existingActual} → ${targetName}`)
    }

    try {
      await sharp(srcPath)
        .rotate()
        .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: JPEG_QUALITY })
        .toFile(destPath)
      processed++
      console.log(`  ✓ ${srcName} → ${targetName}`)
    } catch (err) {
      console.error(`  ✗ ${srcName}: ${err.message}`)
      process.exit(1)
    }
  }

  const existingDestFiles = await fs.readdir(DEST_DIR)
  let removed = 0
  for (const file of existingDestFiles) {
    if (!targets.has(file)) {
      await fs.unlink(path.join(DEST_DIR, file))
      console.log(`  − removed orphan ${file}`)
      removed++
    }
  }

  console.log(
    `\nDone. processed=${processed} skipped=${skipped} recased=${renamed} removed=${removed} total=${targets.size}`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
