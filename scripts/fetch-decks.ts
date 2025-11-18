import * as fs from "fs";
import * as path from "path";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { Readable } from "stream";

const SPREADSHEET_ID = "1l70c7fsk1SFF3swyhdQuxLJqArZuB9pnsJjiI51axOY";
const SHEET_GID = "0";

interface DeckData {
  name: string;
  imageUrl: string;
  lastUpdated: string;
}

interface Deck {
  name: string;
  imagePath: string;
  lastUpdated: string;
}

/**
 * Downloads an image from a URL and saves it locally
 */
async function downloadImage(url: string, filePath: string): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText} (${response.status})`);
    }

    const buffer = await response.arrayBuffer();
    await fs.promises.writeFile(filePath, Buffer.from(buffer));
    console.log(`  ✓ Downloaded: ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`  ✗ Error downloading ${url}:`, error);
    throw error;
  }
}

/**
 * Gets file extension from URL or content type
 */
async function getImageExtension(url: string): Promise<string> {
  // Try to get extension from URL first
  const urlMatch = url.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i);
  if (urlMatch) {
    return urlMatch[1].toLowerCase() === "jpeg" ? "jpg" : urlMatch[1].toLowerCase();
  }

  // Try to get from content type by making a HEAD request
  try {
    const response = await fetch(url, { method: "HEAD" });
    const contentType = response.headers.get("content-type");
    if (contentType) {
      const typeMatch = contentType.match(/image\/(jpg|jpeg|png|gif|webp|svg)/i);
      if (typeMatch) {
        return typeMatch[1].toLowerCase() === "jpeg" ? "jpg" : typeMatch[1].toLowerCase();
      }
    }
  } catch (error) {
    // If HEAD request fails, continue with default
  }

  // Default to jpg
  return "jpg";
}

/**
 * Sanitizes a filename
 */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-z0-9]/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

/**
 * Fetches and parses deck data from Google Sheets CSV export
 */
async function fetchDecksFromSheets(): Promise<DeckData[]> {
  const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${SHEET_GID}`;
  const response = await fetch(csvUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch spreadsheet: ${response.statusText}`);
  }

  const csvText = await response.text();
  return parseCSV(csvText);
}

/**
 * Parses CSV text into DeckData objects
 */
function parseCSV(csvText: string): DeckData[] {
  const lines = csvText.split("\n").map((line) => line.trim());

  if (lines.length < 2) {
    return [];
  }

  const dataLines = lines.slice(1);
  const decks: DeckData[] = [];

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i];
    if (!line) continue;

    const columns = parseCSVLine(line);

    if (columns.length < 5) continue;

    const deckName = columns[0]?.trim();
    const imageUrl = columns[1]?.trim();
    const year = columns[2]?.trim();
    const month = columns[3]?.trim();
    const day = columns[4]?.trim();

    if (!deckName || !imageUrl) continue;

    let lastUpdated = "";
    if (year && month && day) {
      const paddedMonth = month.padStart(2, "0");
      const paddedDay = day.padStart(2, "0");
      lastUpdated = `${year}-${paddedMonth}-${paddedDay}`;
    } else {
      lastUpdated = new Date().toISOString().split("T")[0];
    }

    decks.push({
      name: deckName,
      imageUrl: imageUrl,
      lastUpdated: lastUpdated,
    });
  }

  return decks;
}

/**
 * Parses a CSV line, handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const columns: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      columns.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  columns.push(current);
  return columns;
}

/**
 * Main function to fetch decks and download images
 */
async function main() {
  console.log("Fetching deck data from Google Sheets...");
  const decks = await fetchDecksFromSheets();
  console.log(`Found ${decks.length} decks`);

  // Create directories
  const publicDir = path.join(process.cwd(), "public");
  const imagesDir = path.join(publicDir, "deck-images");
  const dataDir = path.join(process.cwd(), "data");

  await fs.promises.mkdir(imagesDir, { recursive: true });
  await fs.promises.mkdir(dataDir, { recursive: true });

  // Download images and create deck objects with local paths
  const processedDecks: Deck[] = [];

  for (let i = 0; i < decks.length; i++) {
    const deck = decks[i];
    console.log(`\n[${i + 1}/${decks.length}] Processing: ${deck.name}`);

    try {
      // Get image extension
      const extension = await getImageExtension(deck.imageUrl);

      // Create filename from deck name
      const filename = `${sanitizeFilename(deck.name)}.${extension}`;
      const imagePath = `/deck-images/${filename}`;
      const filePath = path.join(imagesDir, filename);

      // Download image
      await downloadImage(deck.imageUrl, filePath);

      processedDecks.push({
        name: deck.name,
        imagePath: imagePath,
        lastUpdated: deck.lastUpdated,
      });
    } catch (error) {
      console.error(`  ✗ Failed to process ${deck.name}:`, error);
      // Continue with other decks even if one fails
    }
  }

  // Save deck data as JSON
  const jsonPath = path.join(dataDir, "decks.json");
  await fs.promises.writeFile(
    jsonPath,
    JSON.stringify(processedDecks, null, 2),
    "utf-8"
  );

  console.log(`\n✅ Successfully processed ${processedDecks.length} decks`);
  console.log(`📁 Images saved to: ${imagesDir}`);
  console.log(`📄 Deck data saved to: ${jsonPath}`);
}

// Run the script
main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});

