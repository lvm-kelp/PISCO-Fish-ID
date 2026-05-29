import { CATEGORIES, type Category } from '../types'

const KNOWN_KEY = 'flashcards:v2:known'
const CATEGORY_KEY = 'flashcards:v2:category'

export function loadKnownIds(): Set<string> {
  try {
    const raw = localStorage.getItem(KNOWN_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.filter((x): x is string => typeof x === 'string'))
  } catch {
    return new Set()
  }
}

export function saveKnownIds(ids: Set<string>): void {
  try {
    localStorage.setItem(KNOWN_KEY, JSON.stringify([...ids]))
  } catch {
    // localStorage unavailable (private mode, quota) — fail silently
  }
}

export function loadSelectedCategory(): Category {
  try {
    const raw = localStorage.getItem(CATEGORY_KEY)
    if (raw && (CATEGORIES as string[]).includes(raw)) return raw as Category
  } catch {
    // ignore
  }
  return 'Fish'
}

export function saveSelectedCategory(category: Category): void {
  try {
    localStorage.setItem(CATEGORY_KEY, category)
  } catch {
    // localStorage unavailable — fail silently
  }
}
