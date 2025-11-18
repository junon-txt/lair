import type { Deck } from "@/types/deck";

const SPREADSHEET_ID = "1l70c7fsk1SFF3swyhdQuxLJqArZuB9pnsJjiI51axOY";
const SHEET_GID = "0"; // Default sheet, adjust if needed

/**
 * Fetches and parses deck data from Google Sheets CSV export
 */
export async function fetchDecksFromSheets(): Promise<Deck[]> {
  try {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${SHEET_GID}`;
    const response = await fetch(csvUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch spreadsheet: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    return parseCSV(csvText);
  } catch (error) {
    console.error("Error fetching decks from Google Sheets:", error);
    throw error;
  }
}

/**
 * Parses CSV text into Deck objects
 * Expected columns: deck_name, image_url, last_updated_year, last_updated_month, last_updated_day
 */
function parseCSV(csvText: string): Deck[] {
  const lines = csvText.split("\n").map((line) => line.trim());
  
  if (lines.length < 2) {
    console.warn("CSV has less than 2 lines");
    return [];
  }
  
  // Skip header row (line 0)
  const dataLines = lines.slice(1);
  const decks: Deck[] = [];
  
  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i];
    if (!line) continue; // Skip empty lines
    
    // Parse CSV line (handling quoted fields)
    const columns = parseCSVLine(line);
    
    if (columns.length < 5) {
      console.warn(`Row ${i + 2} has ${columns.length} columns, expected 5. Line: ${line.substring(0, 100)}`);
      continue; // Skip incomplete rows
    }
    
    const deckName = columns[0]?.trim();
    const imageUrl = columns[1]?.trim();
    const year = columns[2]?.trim();
    const month = columns[3]?.trim();
    const day = columns[4]?.trim();
    
    // Skip rows with missing essential data
    if (!deckName || !imageUrl) {
      if (!deckName) console.warn(`Row ${i + 2}: Missing deck name`);
      if (!imageUrl) console.warn(`Row ${i + 2}: Missing image URL`);
      continue;
    }
    
    // Build date string (YYYY-MM-DD format)
    let lastUpdated = "";
    if (year && month && day) {
      // Pad month and day with leading zeros if needed
      const paddedMonth = month.padStart(2, "0");
      const paddedDay = day.padStart(2, "0");
      lastUpdated = `${year}-${paddedMonth}-${paddedDay}`;
    } else {
      // Use current date as fallback if date is missing
      lastUpdated = new Date().toISOString().split("T")[0];
    }
    
    decks.push({
      name: deckName,
      imageUrl: imageUrl,
      lastUpdated: lastUpdated,
    });
  }
  
  console.log(`Parsed ${decks.length} decks from CSV`);
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
  
  // Push the last column
  columns.push(current);
  
  return columns;
}

