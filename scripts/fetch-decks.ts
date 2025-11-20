import * as fs from "fs";
import * as path from "path";

const SPREADSHEET_ID = "1l70c7fsk1SFF3swyhdQuxLJqArZuB9pnsJjiI51axOY";
const SHEET_GID = "0";

interface DeckData {
  name: string;
  cardId: string;
  imageUrl: string;
  lastUpdated: string;
  status: string;
}

interface Deck {
  name: string;
  cardId: string;
  imageUrl: string;
  lastUpdated: string;
  status: string;
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
 * Expected columns: deck_name, card_id, image_url, last_updated_year, last_updated_month, last_updated_day, status
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

    // New columns: deck_name, card_id, image_url, last_updated_year, last_updated_month, last_updated_day, status
    if (columns.length < 7) continue;

    const deckName = columns[0]?.trim();
    const cardId = columns[1]?.trim();
    const imageUrl = columns[2]?.trim(); // This column exists but we'll build from card_id
    const year = columns[3]?.trim();
    const month = columns[4]?.trim();
    const day = columns[5]?.trim();
    const status = columns[6]?.trim();

    if (!deckName || !cardId) continue;

    // Build image URL from card_id
    const builtImageUrl = `https://images.ygoprodeck.com/images/cards_cropped/${cardId}.jpg`;

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
      cardId: cardId,
      imageUrl: builtImageUrl,
      lastUpdated: lastUpdated,
      status: status || "",
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
 * Main function to fetch decks and create deck objects
 */
async function main() {
  console.log("Fetching deck data from Google Sheets...");
  const decks = await fetchDecksFromSheets();
  console.log(`Found ${decks.length} decks`);

  // Create data directory (no longer need images directory since we use external URLs)
  const dataDir = path.join(process.cwd(), "data");
  await fs.promises.mkdir(dataDir, { recursive: true });

  // Create deck objects (using external image URLs, no downloading needed)
  const processedDecks: Deck[] = [];

  for (let i = 0; i < decks.length; i++) {
    const deck = decks[i];
    console.log(`\n[${i + 1}/${decks.length}] Processing: ${deck.name} (${deck.status})`);

    processedDecks.push({
      name: deck.name,
      cardId: deck.cardId,
      imageUrl: deck.imageUrl,
      lastUpdated: deck.lastUpdated,
      status: deck.status,
    });
    console.log(`  ✓ Added: ${deck.name}`);
  }

  // Save deck data as JSON
  const jsonPath = path.join(dataDir, "decks.json");
  await fs.promises.writeFile(
    jsonPath,
    JSON.stringify(processedDecks, null, 2),
    "utf-8"
  );

  console.log(`\n✅ Successfully processed ${processedDecks.length} decks`);
  console.log(`📄 Deck data saved to: ${jsonPath}`);
}

// Run the script
main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});

