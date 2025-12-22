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

5. Create `.env.local` for local development:
```bash
echo "NEXT_PUBLIC_BASE_PATH=" > .env.local
```

This file is gitignored and allows the app to run at the root path (`localhost:3000/`) instead of `/lair/` for easier local development.

6. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Note**: The development server uses the basePath from `.env.local` (empty by default for local dev). Production builds use `/lair` basePath for GitHub Pages deployment.

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
2. Build the Next.js application with static export enabled
3. Generate static files in the `out/` directory (ready for GitHub Pages)

**Note**: With `output: 'export'` configured in `next.config.mjs`, Next.js generates a fully static site in the `out/` directory that can be deployed to any static hosting service.

### Testing Production Build Locally

To test the production build locally (with `/lair` basePath):

```bash
npm run serve:local
```

This will:
1. Rebuild with empty basePath (for local testing)
2. Serve the static files from the `out/` directory
3. Make the app available at `http://localhost:3000/`

Alternatively, to test with the production basePath structure:

```bash
NEXT_PUBLIC_BASE_PATH=/lair npm run build
npm run serve
```

Then access at `http://localhost:3000/lair/`

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
2. **Build Time**: 
   - The `prebuild` script automatically runs `fetch-decks` which:
     - Fetches CSV data from Google Sheets (with retry logic and timeout)
     - Parses deck information
     - Uses external image URLs (from ygoprodeck.com) - no local image downloads needed
     - Saves deck metadata to `data/decks.json`
     - Falls back to existing `decks.json` if fetch fails (prevents broken builds)
   - Next.js builds a static site with `output: 'export'` enabled
   - The basePath is configured via `NEXT_PUBLIC_BASE_PATH` environment variable
   - All static files are generated in the `out/` directory
3. **Runtime**: The static site:
   - Serves pre-rendered HTML pages
   - Includes all deck data bundled in the `out/` directory
   - Loads images from external URLs (ygoprodeck.com)
   - Provides client-side sorting and search functionality
   - Renders a responsive grid layout
   - Shows "Last Changes" section with recently freed or banned decks

## 🚀 Deployment to GitHub Pages

### Automatic Deployment (Recommended)

The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically deploys to GitHub Pages on pushes to the `main` branch.

**How deployment is triggered:**
- **Automatic**: Every push to the `main` branch triggers a new deployment
- **Manual**: You can also trigger it manually from the GitHub Actions tab

**How it works:**
1. When you push to the `main` branch, GitHub Actions automatically:
   - Checks out the repository
   - Sets up Node.js 20.x
   - Installs dependencies with `npm ci`
   - Sets `NEXT_PUBLIC_BASE_PATH=/lair` environment variable
   - Runs `npm run build` (which automatically runs `fetch-decks` first via `prebuild` hook)
   - Deploys the `out/` directory to GitHub Pages using `peaceiris/actions-gh-pages`

**Setup:**
1. Ensure your repository has GitHub Pages enabled in Settings → Pages
2. Set the source to "GitHub Actions" (not "Deploy from a branch")
3. Push to the `main` branch to trigger deployment

**Deployment URL:**
- The app will be available at: `https://<username>.github.io/lair/` (or your custom domain)
- The basePath `/lair` is configured in the GitHub Actions workflow

### Manual Deployment

If you want to deploy manually:

1. Build the static site:
```bash
npm run build
```

This generates all static files in the `out/` directory.

2. Deploy the `out/` directory:
   - **GitHub Pages**: Push the `out/` directory contents to the `gh-pages` branch
   - **Other hosting**: Upload the contents of the `out/` directory to your hosting provider

**Important Notes:**
- The `out/` directory contains the complete static site
- The `.nojekyll` file in `public/` is automatically copied to `out/` to prevent Jekyll processing
- All images and assets are included in the `out/` directory

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

- `npm run dev` - Start development server (uses `.env.local` basePath, empty by default)
- `npm run build` - Build for production (automatically runs `fetch-decks` first)
  - Uses `NEXT_PUBLIC_BASE_PATH` from environment (defaults to `/lair` if not set)
- `npm run start` - Start production server (requires a built app)
- `npm run serve` - Serve the static build from `out/` directory using `serve` package
- `npm run serve:local` - Rebuild with empty basePath and serve locally (for testing)
- `npm run fetch-decks` - Manually fetch and download decks from Google Sheets
- `npm run lint` - Run ESLint

### Environment Variables

The app uses environment variables to configure the base path:

- **Local Development** (`.env.local` file, gitignored):
  ```bash
  NEXT_PUBLIC_BASE_PATH=
  ```
  This allows the app to run at `localhost:3000/` for easier local development.

- **Production** (set in GitHub Actions workflow):
  ```bash
  NEXT_PUBLIC_BASE_PATH=/lair
  ```
  This ensures the app works correctly when deployed to GitHub Pages at `/lair/` path.

**Note**: The `.env.local` file is gitignored and should not be committed. The production build explicitly sets the environment variable in the GitHub Actions workflow.

### Adding New Features

- Components: Add to `components/` directory
- Pages: Add to `app/` directory (Next.js App Router)
- Types: Add to `types/` directory
- Utilities: Add to `lib/` directory

## 🔍 Troubleshooting

### Images not loading locally
- Check that `.env.local` exists and has `NEXT_PUBLIC_BASE_PATH=` (empty string)
- Restart the dev server after creating/modifying `.env.local`
- Verify the image URLs in `data/decks.json` are valid

### Build fails with fetch error
- Check network connectivity
- Verify Google Sheets is accessible and publicly shared
- The script should fallback to existing `decks.json` if available
- Check the `scripts/fetch-decks.ts` file for the correct `SPREADSHEET_ID`

### 404 errors when serving static build
- If using `npm run serve`, make sure you built with the correct basePath
- For local testing without basePath: use `npm run serve:local`
- For testing with production basePath: build with `NEXT_PUBLIC_BASE_PATH=/lair` and access at `http://localhost:3000/lair/`

### Deployment issues
- Ensure GitHub Pages is enabled in repository settings
- Check that the GitHub Actions workflow completed successfully
- Verify `NEXT_PUBLIC_BASE_PATH=/lair` is set in the workflow (it should be)
- Check the Actions tab for any error messages

## 📄 License

This project is licensed under the MIT License.
