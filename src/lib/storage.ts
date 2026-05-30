import { CATEGORIES, type Category } from '../types'

const KNOWN_KEY = 'flashcards:v2:known'
const DEFERRED_KEY = 'flashcards:v2:deferred'
const CATEGORY_KEY = 'flashcards:v2:category'

function loadStringSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.filter((x): x is string => typeof x === 'string'))
  } catch {
    return new Set()
  }
}

function saveStringSet(key: string, ids: Set<string>): void {
  try {
    localStorage.setItem(key, JSON.stringify([...ids]))
  } catch {
    // localStorage unavailable (private mode, quota) — fail silently
  }
}

export function loadKnownIds(): Set<string> {
  return loadStringSet(KNOWN_KEY)
}

export function saveKnownIds(ids: Set<string>): void {
  saveStringSet(KNOWN_KEY, ids)
}

export function loadDeferredIds(): Set<string> {
  return loadStringSet(DEFERRED_KEY)
}

export function saveDeferredIds(ids: Set<string>): void {
  saveStringSet(DEFERRED_KEY, ids)
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
