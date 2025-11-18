"use client";

import { useState, useEffect, useRef } from "react";
import type { Deck } from "@/types/deck";

interface DeckCardProps {
  deck: Deck;
}

export default function DeckCard({ deck }: DeckCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    // Reset loading state when image path changes
    setImageLoading(true);
    setImageError(false);

    // Check if image is already loaded (cached images)
    const checkImageLoaded = () => {
      if (imgRef.current?.complete && imgRef.current.naturalHeight !== 0) {
        setImageLoading(false);
      }
    };

    // Check immediately
    checkImageLoaded();

    // Also check after a short delay in case the ref isn't ready yet
    const timeout = setTimeout(checkImageLoaded, 100);
    
    // Fallback: hide loading after 5 seconds (in case onLoad never fires)
    const fallbackTimeout = setTimeout(() => {
      setImageLoading((prev) => {
        if (prev) {
          console.warn(`Image loading timeout for: ${deck.imagePath}`);
          return false;
        }
        return prev;
      });
    }, 5000);
    
    return () => {
      clearTimeout(timeout);
      clearTimeout(fallbackTimeout);
    };
  }, [deck.imagePath]);

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
      <div className="w-full aspect-square relative bg-gray-200 overflow-hidden">
        {!imageError ? (
          <>
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 z-10">
                <div className="text-gray-400 text-sm">Loading...</div>
              </div>
            )}
            <img
              ref={imgRef}
              src={deck.imagePath}
              alt={deck.name}
              className="w-full h-full object-cover"
              onError={() => {
                console.error("Image failed to load:", deck.imagePath);
                setImageError(true);
                setImageLoading(false);
              }}
              onLoad={() => {
                setImageLoading(false);
              }}
              loading="lazy"
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-400">
            <div className="text-center p-4">
              <div className="text-4xl mb-2">🖼️</div>
              <div className="text-xs">Image not available</div>
            </div>
          </div>
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

