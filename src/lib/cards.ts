import { folderToCategory, type Card } from '../types'

const imageModules = import.meta.glob('/images-processed/**/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

function titleCaseWord(word: string): string {
  if (/^[A-Z][A-Z0-9]+$/.test(word)) return word
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

function filenameToName(filename: string): string {
  const stem = filename.replace(/\.[^.]+$/, '')
  return stem
    .replace(/[-_]+/g, ' ')
    .replace(/\s*\d+$/, '')
    .trim()
    .split(/\s+/)
    .map(titleCaseWord)
    .join(' ')
}

export const allCards: Card[] = Object.entries(imageModules)
  .map(([fullPath, url]) => {
    // fullPath looks like "/images-processed/fish/Black Rockfish.jpg"
    const parts = fullPath.split('/')
    const filename = parts[parts.length - 1]
    const folder = parts[parts.length - 2]
    const category = folderToCategory(folder)
    if (!category) return null
    return {
      id: `${folder}/${filename}`,
      name: filenameToName(filename),
      imageUrl: url,
      category,
    }
  })
  .filter((c): c is Card => c !== null)
  .sort((a, b) => a.name.localeCompare(b.name))
