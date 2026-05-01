type Props = {
  isFlipped: boolean
  canUndo: boolean
  onFlip: () => void
  onPractice: () => void
  onKnown: () => void
  onUndo: () => void
}

export function Controls({ isFlipped, canUndo, onFlip, onPractice, onKnown, onUndo }: Props) {
  return (
    <div className="w-full max-w-md flex flex-col gap-3">
      {!isFlipped ? (
        <button
          type="button"
          onClick={onFlip}
          className="w-full py-4 rounded-xl bg-sea-600 hover:bg-sea-700 active:bg-sea-700 text-white font-semibold text-lg shadow-lg transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-sea-300/60"
        >
          Reveal name
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onPractice}
            className="py-4 rounded-xl bg-sea-700 hover:bg-sea-800 active:bg-sea-800 text-white font-semibold text-lg shadow-lg transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-sea-300/60"
          >
            Still Needs Practice
          </button>
          <button
            type="button"
            onClick={onKnown}
            className="py-4 rounded-xl bg-sea-500 hover:bg-sea-600 active:bg-sea-600 text-white font-semibold text-lg shadow-lg transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-sea-300/60"
          >
            I Knew It!
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        className="w-full py-2 rounded-lg text-sea-100 font-medium text-sm disabled:text-sea-100/30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sea-300/50"
      >
        Undo last action
      </button>
    </div>
  )
}
