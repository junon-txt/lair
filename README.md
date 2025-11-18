# Magic Lair

A static web application for displaying Yu-Gi-Oh! deck collections. The app automatically fetches deck data from a Google Sheets spreadsheet and displays them with images, names, and last updated dates. Images are downloaded at build time and served statically for optimal performance.

## ✨ Features

- 📊 **Google Sheets Integration**: Automatically syncs deck data from a public Google Sheets spreadsheet
- 🖼️ **Static Image Serving**: Images are downloaded at build time and served locally for fast loading
- 🔄 **Dynamic Sorting**: Sort decks alphabetically or by last updated date
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- ⚡ **Fast Performance**: Static site generation with optimized images

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Google Sheets spreadsheet with the following columns:
  - `deck_name` - Name of the deck
  - `image_url` - URL to the deck image
  - `last_updated_year` - Year of last update
  - `last_updated_month` - Month of last update
  - `last_updated_day` - Day of last update

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd lair
```

2. Install dependencies:
```bash
npm install
```

3. Configure the Google Sheets ID:
   - Open `scripts/fetch-decks.ts`
   - Update the `SPREADSHEET_ID` constant with your Google Sheets ID
   - Make sure your Google Sheet is publicly accessible (shared with "Anyone with the link")

4. Fetch deck data and images:
```bash
npm run fetch-decks
```

This will:
- Download all deck images to `public/deck-images/`
- Generate `data/decks.json` with deck information

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

### Updating Deck Data

1. Update your Google Sheets spreadsheet with new decks or changes
2. Run the fetch script to download updated data:
```bash
npm run fetch-decks
```

The script will:
- Fetch the latest data from Google Sheets
- Download new or updated images
- Update the `data/decks.json` file

### Building for Production

The build process automatically runs `fetch-decks` before building:

```bash
npm run build
```

This will:
1. Run `fetch-decks` to get the latest data
2. Build the Next.js application
3. Generate static files in the `.next` directory

### Running Production Build

```bash
npm run start
```

## 🔧 Technologies Used

- **[Next.js](https://nextjs.org/)** - React framework with static site generation
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[ESLint](https://eslint.org/)** - Code quality and linting
- **[tsx](https://github.com/esbuild-kit/tsx)** - TypeScript execution for build scripts

## 📁 Project Structure

```
lair/
├── app/                    # Next.js app directory
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page component
│   └── globals.css         # Global styles
├── components/             # React components
│   └── DeckCard.tsx        # Deck card component
├── data/                   # Generated data (gitignored)
│   └── decks.json          # Deck data from Google Sheets
├── lib/                    # Utility libraries
│   └── sheets.ts           # Google Sheets fetching (legacy, not used in build)
├── public/                 # Static assets
│   └── deck-images/        # Downloaded deck images (gitignored)
├── scripts/                # Build scripts
│   └── fetch-decks.ts      # Script to fetch and download decks
├── types/                  # TypeScript type definitions
│   └── deck.ts             # Deck interface
└── package.json            # Dependencies and scripts
```

## 🔄 How It Works

1. **Data Source**: The app reads from a Google Sheets spreadsheet via CSV export
2. **Build Time**: The `fetch-decks` script:
   - Fetches CSV data from Google Sheets
   - Parses deck information
   - Downloads all images to `public/deck-images/`
   - Saves deck metadata to `data/decks.json`
3. **Runtime**: The Next.js app:
   - Reads deck data from `data/decks.json`
   - Serves images from `public/deck-images/`
   - Provides sorting functionality
   - Renders a responsive grid layout

## 🚀 Deployment to GitHub Pages

The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically deploys to GitHub Pages on pushes to the `main` branch.

### Manual Deployment

1. Build the project:
```bash
npm run build
```

2. Export static files:
```bash
npm run export
```

3. Deploy the `out` directory to your hosting provider

## 📝 Google Sheets Format

Your Google Sheet should have the following structure:

| deck_name | image_url | last_updated_year | last_updated_month | last_updated_day |
|-----------|-----------|-------------------|---------------------|------------------|
| Azamina   | https://... | 2025              | 11                  | 18               |

**Important**: 
- The sheet must be publicly accessible (shared with "Anyone with the link")
- Image URLs must be publicly accessible
- Empty rows will be skipped

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production (automatically runs `fetch-decks`)
- `npm run start` - Start production server
- `npm run fetch-decks` - Manually fetch and download decks
- `npm run lint` - Run ESLint

### Adding New Features

- Components: Add to `components/` directory
- Pages: Add to `app/` directory (Next.js App Router)
- Types: Add to `types/` directory
- Utilities: Add to `lib/` directory

## 📄 License

This project is licensed under the MIT License.
