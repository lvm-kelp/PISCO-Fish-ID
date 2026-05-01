import type { Card } from '../types'

const imageModules = import.meta.glob('/images-processed/*.jpg', {
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

function pathToFilename(path: string): string {
  const parts = path.split('/')
  return parts[parts.length - 1]
}

export const allCards: Card[] = Object.entries(imageModules)
  .map(([path, url]) => {
    const filename = pathToFilename(path)
    return {
      id: filename,
      name: filenameToName(filename),
      imageUrl: url,
    }
  })
  .sort((a, b) => a.name.localeCompare(b.name))
