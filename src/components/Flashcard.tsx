import type { Card } from '../types'

type Props = {
  card: Card
  isFlipped: boolean
  onFlip: () => void
}

export function Flashcard({ card, isFlipped, onFlip }: Props) {
  return (
    <div className="perspective-1000 w-full max-w-md">
      <button
        type="button"
        onClick={onFlip}
        aria-label={isFlipped ? 'Flip card to image' : 'Flip card to reveal name'}
        aria-pressed={isFlipped}
        className="relative block w-full aspect-[8/5] preserve-3d transition-transform duration-700 ease-out focus:outline-none focus-visible:ring-4 focus-visible:ring-sea-500/50 rounded-2xl"
        style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        <div className="absolute inset-0 backface-hidden rounded-2xl shadow-2xl bg-gradient-to-br from-sea-600/20 via-sea-700/25 to-sea-800/35 backdrop-blur-sm overflow-hidden ring-1 ring-white/30">
          <img
            src={card.imageUrl}
            alt={card.name}
            className="w-full h-full object-contain"
            loading="eager"
            draggable={false}
          />
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-sea-900/60 text-sea-50 text-xs font-medium pointer-events-none backdrop-blur-sm">
            Tap to reveal
          </div>
        </div>

        <div
          className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl shadow-2xl bg-gradient-to-br from-sea-600/55 via-sea-700/60 to-sea-800/70 backdrop-blur-md text-white flex items-center justify-center p-6 ring-1 ring-white/30"
        >
          
{isFlipped && (
<span className="text-4xl sm:text-5xl font-bold text-center leading-tight break-words drop-shadow-lg">
            {card.name}
          </span>
)}
        </div>
      </button>
    </div>
  )
}
