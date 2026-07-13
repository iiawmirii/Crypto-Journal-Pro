# Crypto Journal Pro

A cryptocurrency trading journal with a futures calculator, PnL stats, and stop-loss tracking. Built with React, TypeScript, Vite, and Electron.

## Features

- **Trade Journal** — Log trades with pair, outcome, PnL, R:R ratio, and chart screenshots
- **Futures Calculator** — Calculate position size, leverage, take-profit targets, and stop-loss levels
- **Performance Stats** — Win rates, profit factors, and daily/weekly/monthly breakdowns with calendar heatmap
- **Stop-Loss History** — Track and audit recurring stop-loss triggers and mistake patterns
- **Theme Customization** — Light, dark, and AMOLED themes with 9 Material Design 3 accent colors
- **Offline-First** — All data stored in localStorage, no server required
- **Backup/Restore** — Export and import trade data as JSON

## Setup

**Prerequisites:** Node.js

1. Install dependencies:
   ```
   npm install
   ```

2. Set the `GEMINI_API_KEY` in `.env.local` (optional, for AI features):
   ```
   GEMINI_API_KEY=your_key_here
   ```

3. Run the dev server:
   ```
   npm run dev
   ```

## Build

- Web build: `npm run build`
- Electron build: `npm run electron:build`

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Electron (desktop builds)
- Lucide React (icons)
- Motion (animations)
