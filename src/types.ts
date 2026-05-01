export type Card = {
  id: string
  name: string
  imageUrl: string
}

export type LastAction = {
  cardId: string
  markedKnown: boolean
} | null
