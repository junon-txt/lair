"use client";

import { useState, useMemo } from "react";
import type { Deck, SortOption } from "@/types/deck";
import DeckCard from "@/components/DeckCard";
import decksData from "@/data/decks.json";

export default function Home() {
  const decks = decksData as Deck[];
  const [sortBy, setSortBy] = useState<SortOption>("alphabetical");

  const sortedDecks = useMemo(() => {
    const sorted = [...decks];
    if (sortBy === "alphabetical") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "last-updated") {
      sorted.sort(
        (a, b) =>
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      );
    }
    return sorted;
  }, [decks, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 p-5 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 drop-shadow-lg">
            Magic Lair
          </h1>
          <p className="text-lg md:text-xl opacity-90">
            Yu-Gi-Oh! Decks Collection
          </p>
        </header>

        <div className="flex justify-center items-center gap-3 mb-8 bg-white rounded-lg p-4 shadow-lg">
          <label htmlFor="sort-select" className="font-semibold text-gray-800">
            Sort by:
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-4 py-2 border-2 border-indigo-500 rounded-lg text-gray-800 bg-white cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            aria-label="Sort decks"
          >
            <option value="alphabetical">Alphabetical</option>
            <option value="last-updated">Last Updated</option>
          </select>
        </div>

        {sortedDecks.length === 0 ? (
          <div className="text-center text-white py-20">
            <div className="text-xl">No decks found</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {sortedDecks.map((deck) => (
              <DeckCard key={deck.name} deck={deck} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

