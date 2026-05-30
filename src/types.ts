export type Category = 'Fish' | 'Algae' | 'Inverts' | 'UPC'

export const CATEGORIES: Category[] = ['Fish', 'Algae', 'Inverts', 'UPC']

export const categoryToFolder: Record<Category, string> = {
  Fish: 'fish',
  Algae: 'algae',
  Inverts: 'inverts',
  UPC: 'upc',
}

const folderToCategoryMap: Record<string, Category> = Object.fromEntries(
  (Object.entries(categoryToFolder) as Array<[Category, string]>).map(([cat, folder]) => [
    folder,
    cat,
  ]),
)

export function folderToCategory(folder: string): Category | null {
  return folderToCategoryMap[folder] ?? null
}

export type Card = {
  id: string
  name: string
  imageUrl: string
  category: Category
}

// Snapshot of state captured before a Known/Practice action, used to restore
// on Undo. Snapshotting both sets (rather than tracking diffs) keeps the undo
// path uniform regardless of which sets the forward action mutated.
export type LastAction = {
  prevKnown: Set<string>
  prevDeferred: Set<string>
  prevCurrentId: string
  prevIsFlipped: boolean
} | null
