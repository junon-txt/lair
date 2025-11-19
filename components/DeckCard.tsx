"use client";

import { useState, useEffect, useRef } from "react";
import type { Deck } from "@/types/deck";

interface DeckCardProps {
  deck: Deck;
}

export default function DeckCard({ deck }: DeckCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Check if image is already loaded (cached images)
  useEffect(() => {
    const checkLoaded = () => {
      if (imgRef.current?.complete && imgRef.current.naturalHeight !== 0) {
        setImageLoaded(true);
      }
    };
    
    // Check immediately
    checkLoaded();
    
    // Also check after a brief delay in case ref isn't ready
    const timeout = setTimeout(checkLoaded, 50);
    
    return () => clearTimeout(timeout);
  }, []);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
      <div className="w-full aspect-square relative bg-gray-200 overflow-hidden">
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-400">
            <div className="text-center p-4">
              <div className="text-4xl mb-2">🖼️</div>
              <div className="text-xs">Image not available</div>
            </div>
          </div>
        ) : (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 z-10">
                <div className="text-gray-400 text-sm">Loading...</div>
              </div>
            )}
            <img
              ref={imgRef}
              src={deck.imagePath}
              alt={deck.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error("Image failed to load:", deck.imagePath, e);
                setImageError(true);
                setImageLoaded(false);
              }}
              onLoad={() => {
                setImageLoaded(true);
              }}
              onLoadStart={() => {
                // Image started loading
              }}
              loading="lazy"
            />
          </>
        )}
      </div>
      <div className="p-4 text-center">
        <div className="text-lg font-semibold text-gray-800 mb-1">
          {deck.name}
        </div>
        <div className="text-sm text-gray-600">
          Updated: {formatDate(deck.lastUpdated)}
        </div>
      </div>
    </div>
  );
}

