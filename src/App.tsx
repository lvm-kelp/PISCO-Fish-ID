import { useEffect, useMemo, useRef, useState } from 'react'
import { Flashcard } from './components/Flashcard'
import { Controls } from './components/Controls'
import { DeckEmpty } from './components/DeckEmpty'
import { allCards } from './lib/cards'
import { loadKnownIds, saveKnownIds } from './lib/storage'
import { pickRandomCard } from './lib/pickRandom'
import type { LastAction } from './types'
import backgroundImage from './assets/background.jpg'

const CARD_SWAP_DELAY_MS = 700

export default function App() {
  const [knownIds, setKnownIds] = useState<Set<string>>(() => loadKnownIds())
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [lastAction, setLastAction] = useState<LastAction>(null)
  const flipResetTimer = useRef<number | null>(null)

  useEffect(() => {
    saveKnownIds(knownIds)
  }, [knownIds])

  const activeDeck = useMemo(
    () => allCards.filter((c) => !knownIds.has(c.id)),
    [knownIds],
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
      const next = pickRandomCard(activeDeck, null)
      setCurrentId(next?.id ?? null)
      setIsFlipped(false)
    }
  }, [activeDeck, currentId])

  useEffect(() => {
    return () => {
      if (flipResetTimer.current !== null) {
        window.clearTimeout(flipResetTimer.current)
      }
    }
  }, [])

  function advanceToNext(prevId: string, deckAfterAction: typeof allCards) {
    setIsFlipped(false)
    if (flipResetTimer.current !== null) {
      window.clearTimeout(flipResetTimer.current)
    }
    flipResetTimer.current = window.setTimeout(() => {
      const next = pickRandomCard(deckAfterAction, prevId)
      setCurrentId(next?.id ?? null)
      flipResetTimer.current = null
    }, CARD_SWAP_DELAY_MS)
  }

  function handleFlip() {
    setIsFlipped((f) => !f)
  }

  function handleKnown() {
    if (!currentCard) return
    const id = currentCard.id
    const nextKnown = new Set(knownIds)
    nextKnown.add(id)
    setKnownIds(nextKnown)
    setLastAction({ cardId: id, markedKnown: true })
    const deckAfter = allCards.filter((c) => !nextKnown.has(c.id))
    advanceToNext(id, deckAfter)
  }

  function handlePractice() {
    if (!currentCard) return
    const id = currentCard.id
    setLastAction({ cardId: id, markedKnown: false })
    advanceToNext(id, activeDeck)
  }

  function handleUndo() {
    if (!lastAction) return
    if (flipResetTimer.current !== null) {
      window.clearTimeout(flipResetTimer.current)
      flipResetTimer.current = null
    }
    const { cardId, markedKnown } = lastAction
    if (markedKnown) {
      const nextKnown = new Set(knownIds)
      nextKnown.delete(cardId)
      setKnownIds(nextKnown)
    }
    setCurrentId(cardId)
    setIsFlipped(true)
    setLastAction(null)
  }

  function handleReset() {
    setKnownIds(new Set())
    setLastAction(null)
    setIsFlipped(false)
  }

  const totalCards = allCards.length
  const knownCount = knownIds.size
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
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight drop-shadow-md">
              PISCO Fish ID Flashcards
            </h1>
            <button
              type="button"
              onClick={() => {
                if (knownCount === 0) return
                if (window.confirm('Reset deck? All cards will return to the rotation.')) {
                  handleReset()
                }
              }}
              disabled={knownCount === 0}
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
    </div>
  )
}
