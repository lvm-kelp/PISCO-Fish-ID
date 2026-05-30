import { useEffect, useMemo, useRef, useState } from 'react'
import { Flashcard } from './components/Flashcard'
import { Controls } from './components/Controls'
import { DeckEmpty } from './components/DeckEmpty'
import { SettingsModal } from './components/SettingsModal'
import { allCards } from './lib/cards'
import {
  loadDeferredIds,
  loadKnownIds,
  loadSelectedCategory,
  saveDeferredIds,
  saveKnownIds,
  saveSelectedCategory,
} from './lib/storage'
import { pickNextCard } from './lib/pickRandom'
import type { Category, LastAction } from './types'
import backgroundImage from './assets/background.jpg'

const CARD_SWAP_DELAY_MS = 0

function withAdd(s: Set<string>, id: string): Set<string> {
  if (s.has(id)) return s
  const next = new Set(s)
  next.add(id)
  return next
}

function withDel(s: Set<string>, id: string): Set<string> {
  if (!s.has(id)) return s
  const next = new Set(s)
  next.delete(id)
  return next
}

export default function App() {
  const [knownIds, setKnownIds] = useState<Set<string>>(() => loadKnownIds())
  const [deferredIds, setDeferredIds] = useState<Set<string>>(() => loadDeferredIds())
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [lastAction, setLastAction] = useState<LastAction>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category>(() => loadSelectedCategory())
  const flipResetTimer = useRef<number | null>(null)

  useEffect(() => {
    saveKnownIds(knownIds)
  }, [knownIds])

  useEffect(() => {
    saveDeferredIds(deferredIds)
  }, [deferredIds])

  useEffect(() => {
    saveSelectedCategory(selectedCategory)
  }, [selectedCategory])

  const categoryCards = useMemo(
    () => allCards.filter((c) => c.category === selectedCategory),
    [selectedCategory],
  )

  const activeDeck = useMemo(
    () => categoryCards.filter((c) => !knownIds.has(c.id)),
    [categoryCards, knownIds],
  )

  const currentCard = useMemo(
    () => (currentId ? allCards.find((c) => c.id === currentId) ?? null : null),
    [currentId],
  )

  useEffect(() => {
    if (activeDeck.length === 0) {
      setCurrentId(null)
      return
    }
    const stillValid = currentId && activeDeck.some((c) => c.id === currentId)
    if (!stillValid) {
      const next = pickNextCard(activeDeck, deferredIds, null)
      setCurrentId(next?.id ?? null)
      setIsFlipped(false)
    }
  }, [activeDeck, currentId, deferredIds])

  useEffect(() => {
    return () => {
      if (flipResetTimer.current !== null) {
        window.clearTimeout(flipResetTimer.current)
      }
    }
  }, [])

  function advanceToNext(
    prevId: string,
    deckAfterAction: typeof allCards,
    deferredAfterAction: Set<string>,
  ) {
    setIsFlipped(false)
    if (flipResetTimer.current !== null) {
      window.clearTimeout(flipResetTimer.current)
    }
    flipResetTimer.current = window.setTimeout(() => {
      const next = pickNextCard(deckAfterAction, deferredAfterAction, prevId)
      setCurrentId(next?.id ?? null)
      flipResetTimer.current = null
    }, CARD_SWAP_DELAY_MS)
  }

  function handleFlip() {
    setIsFlipped((f) => !f)
  }

  function snapshot(): NonNullable<LastAction> | null {
    if (!currentCard) return null
    return {
      prevKnown: knownIds,
      prevDeferred: deferredIds,
      prevCurrentId: currentCard.id,
      prevIsFlipped: isFlipped,
    }
  }

  function handleKnown() {
    if (!currentCard) return
    const id = currentCard.id
    const snap = snapshot()
    const nextKnown = withAdd(knownIds, id)
    const nextDeferred = withDel(deferredIds, id)
    setKnownIds(nextKnown)
    setDeferredIds(nextDeferred)
    setLastAction(snap)
    const deckAfter = categoryCards.filter((c) => !nextKnown.has(c.id))
    advanceToNext(id, deckAfter, nextDeferred)
  }

  function handlePractice() {
    if (!currentCard) return
    const id = currentCard.id
    const snap = snapshot()
    const nextDeferred = withAdd(deferredIds, id)
    setDeferredIds(nextDeferred)
    setLastAction(snap)
    advanceToNext(id, activeDeck, nextDeferred)
  }

  function handleUndo() {
    if (!lastAction) return
    if (flipResetTimer.current !== null) {
      window.clearTimeout(flipResetTimer.current)
      flipResetTimer.current = null
    }
    setKnownIds(lastAction.prevKnown)
    setDeferredIds(lastAction.prevDeferred)
    setCurrentId(lastAction.prevCurrentId)
    setIsFlipped(lastAction.prevIsFlipped)
    setLastAction(null)
  }

  function handleReset() {
    const nextKnown = new Set(knownIds)
    const nextDeferred = new Set(deferredIds)
    for (const c of categoryCards) {
      nextKnown.delete(c.id)
      nextDeferred.delete(c.id)
    }
    setKnownIds(nextKnown)
    setDeferredIds(nextDeferred)
    setLastAction(null)
    setIsFlipped(false)
  }

  function handleCategoryChange(category: Category) {
    if (category === selectedCategory) return
    if (flipResetTimer.current !== null) {
      window.clearTimeout(flipResetTimer.current)
      flipResetTimer.current = null
    }
    setSelectedCategory(category)
    setLastAction(null)
    setIsFlipped(false)
    setCurrentId(null)
  }

  const totalCards = categoryCards.length
  const knownCount = totalCards - activeDeck.length
  const deferredCount = categoryCards.reduce((n, c) => n + (deferredIds.has(c.id) ? 1 : 0), 0)
  const canReset = knownCount > 0 || deferredCount > 0
  const progressPct = totalCards === 0 ? 0 : Math.round((knownCount / totalCards) * 100)
  const showEmptyState = totalCards === 0 || activeDeck.length === 0

  return (
    <div className="relative min-h-full flex flex-col">
      <div
        aria-hidden
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div
        aria-hidden
        className="fixed inset-0 bg-gradient-to-b from-sea-900/45 via-sea-800/15 to-sea-900/65"
      />

      <header className="relative z-10 px-4 pt-4 pb-3 sm:pt-6 sm:pb-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMenuOpen(true)}
                aria-label="Open settings"
                className="text-white hover:text-sea-100 drop-shadow-md p-1 -m-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-sea-300/60"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
              </button>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight drop-shadow-md">
                PISCO Flashcards
              </h1>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!canReset) return
                if (
                  window.confirm(
                    `Reset ${selectedCategory} deck? All ${selectedCategory} cards will return to the rotation.`,
                  )
                ) {
                  handleReset()
                }
              }}
              disabled={!canReset}
              className="text-xs font-medium text-sea-100 disabled:text-sea-100/30 hover:underline disabled:no-underline"
            >
              Reset
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="h-full bg-sea-300 transition-all duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
                role="progressbar"
                aria-valuenow={knownCount}
                aria-valuemin={0}
                aria-valuemax={totalCards}
                aria-label={`${knownCount} of ${totalCards} cards known`}
              />
            </div>
            <span className="text-xs font-medium text-sea-100 tabular-nums drop-shadow">
              {knownCount} / {totalCards}
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-start gap-6 px-4 pt-2 sm:pt-4 pb-6">
        {showEmptyState || !currentCard ? (
          <DeckEmpty totalCards={totalCards} onReset={handleReset} />
        ) : (
          <>
            <Flashcard card={currentCard} isFlipped={isFlipped} onFlip={handleFlip} />
            <Controls
              isFlipped={isFlipped}
              canUndo={lastAction !== null}
              onFlip={handleFlip}
              onPractice={handlePractice}
              onKnown={handleKnown}
              onUndo={handleUndo}
            />
          </>
        )}
      </main>

      <SettingsModal
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        selected={selectedCategory}
        onSelect={handleCategoryChange}
      />
    </div>
  )
}
