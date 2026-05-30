import type { Card } from '../types'

export function pickRandomCard(deck: Card[], avoidId: string | null): Card | null {
  if (deck.length === 0) return null
  if (deck.length === 1) return deck[0]

  const candidates = avoidId ? deck.filter((c) => c.id !== avoidId) : deck
  const pool = candidates.length > 0 ? candidates : deck
  return pool[Math.floor(Math.random() * pool.length)]
}

// Picks the next card from `active`, preferring cards that are NOT in
// `deferred`. Cards land in `deferred` when the user clicks "Practice", so
// they only resurface after every non-deferred card has been shown.
export function pickNextCard(
  active: Card[],
  deferred: Set<string>,
  avoidId: string | null,
): Card | null {
  if (active.length === 0) return null
  const fresh = active.filter((c) => !deferred.has(c.id))
  if (fresh.length > 0) return pickRandomCard(fresh, avoidId)
  return pickRandomCard(active, avoidId)
}
