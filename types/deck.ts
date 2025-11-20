export interface Deck {
  name: string;
  cardId: string;
  imageUrl: string;
  lastUpdated: string;
  status: string;
}

export type SortOption = "alphabetical" | "last-updated";

