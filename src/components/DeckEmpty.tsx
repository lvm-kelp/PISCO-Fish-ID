type Props = {
  totalCards: number
  onReset: () => void
}

export function DeckEmpty({ totalCards, onReset }: Props) {
  if (totalCards === 0) {
    return (
      <div className="w-full max-w-md text-center bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 ring-1 ring-white/40">
        <h2 className="text-2xl font-bold text-sea-800 mb-2">No cards yet</h2>
        <p className="text-sea-700">
          Add image files to the <code className="px-1.5 py-0.5 bg-sea-50 rounded">images/</code>{' '}
          folder. Filenames become the card names (e.g.{' '}
          <code className="px-1.5 py-0.5 bg-sea-50 rounded">great-white-shark.jpg</code> → "Great
          White Shark").
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md text-center bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 ring-1 ring-white/40">
      <div className="text-5xl mb-3" aria-hidden="true">
        🐚
      </div>
      <h2 className="text-2xl font-bold text-sea-800 mb-2">All caught up</h2>
      <p className="text-sea-700 mb-6">
        You've marked all {totalCards} cards as known. Reset the deck to start over.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="w-full py-3 rounded-xl bg-sea-600 hover:bg-sea-700 active:bg-sea-700 text-white font-semibold shadow-md transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-sea-300/60"
      >
        Reset deck
      </button>
    </div>
  )
}
