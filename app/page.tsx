"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import type { Deck, SortOption } from "@/types/deck";
import DeckCard from "@/components/DeckCard";
import decksData from "@/data/decks.json";

export default function Home() {
  const decks = decksData as Deck[];
  const [sortBy, setSortBy] = useState<SortOption>("alphabetical");
  const [searchQuery, setSearchQuery] = useState("");

  const sortedDecks = useMemo(() => {
    // First filter by search query
    let filtered = decks;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = decks.filter((deck) =>
        deck.name.toLowerCase().includes(query)
      );
    }

    // Then sort
    const sorted = [...filtered];
    if (sortBy === "alphabetical") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "last-updated") {
      sorted.sort(
        (a, b) =>
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      );
    }
    return sorted;
  }, [decks, sortBy, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 p-5 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-center gap-4 mb-10 text-white">
          <Image
            src="/lair/magiclair_logo.webp"
            alt="Magic Lair Logo"
            width={0}
            height={0}
            className="h-[3.5rem] md:h-[4.5rem] w-auto"
            priority
          />
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 drop-shadow-lg">
              Magic Lair
            </h1>
            <p className="text-lg md:text-xl opacity-90">
              HOTU banlist
            </p>
          </div>
        </header>

        <div className="mb-8 bg-white rounded-lg p-4 shadow-lg flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label htmlFor="search-input" className="block font-semibold text-gray-800 mb-2">
              Search decks:
            </label>
            <input
              id="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type to filter decks"
              className="w-full px-4 py-2 border-2 border-indigo-500 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
              aria-label="Search decks"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label htmlFor="sort-select" className="font-semibold text-gray-800 whitespace-nowrap">
              Sort by:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 border-2 border-indigo-500 rounded-lg text-gray-800 bg-white cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors flex-1 sm:flex-initial"
              aria-label="Sort decks"
            >
              <option value="alphabetical">Alphabetical</option>
              <option value="last-updated">Last Updated</option>
            </select>
          </div>
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

