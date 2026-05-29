import { useEffect } from 'react'
import { CATEGORIES, type Category } from '../types'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSelect: (category: Category) => void
  selected: Category
}

export function SettingsModal({ isOpen, onClose, onSelect, selected }: Props) {
  useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div
        onClick={onClose}
        className="absolute inset-0 bg-sea-900/60 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div className="relative w-full max-w-sm bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl ring-1 ring-white/40 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 id="settings-modal-title" className="text-base font-bold text-sea-900">
            Category
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-sea-700 hover:text-sea-900 p-1 -m-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-sea-300/60"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </svg>
          </button>
        </div>
        <ul className="flex flex-col gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = cat === selected
            return (
              <li key={cat}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(cat)
                    onClose()
                  }}
                  aria-pressed={isSelected}
                  className={
                    isSelected
                      ? 'w-full flex items-center justify-between px-4 py-3 rounded-xl bg-sea-600 text-white font-semibold ring-2 ring-sea-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sea-300/60'
                      : 'w-full flex items-center justify-between px-4 py-3 rounded-xl bg-sea-100 hover:bg-sea-200 active:bg-sea-300 text-sea-900 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sea-400/60'
                  }
                >
                  <span>{cat}</span>
                  {isSelected && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
