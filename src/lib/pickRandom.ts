import type { Card } from '../types'

export function pickRandomCard(deck: Card[], avoidId: string | null): Card | null {
  if (deck.length === 0) return null
  if (deck.length === 1) return deck[0]

  const candidates = avoidId ? deck.filter((c) => c.id !== avoidId) : deck
  const pool = candidates.length > 0 ? candidates : deck
  return pool[Math.floor(Math.random() * pool.length)]
}
