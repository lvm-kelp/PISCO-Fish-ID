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

export type LastAction = {
  cardId: string
  markedKnown: boolean
} | null
