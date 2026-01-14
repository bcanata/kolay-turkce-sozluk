# Repository Guidelines

## Project Structure & Module Organization
- `src/app` hosts the Next.js App Router pages and route segments like `src/app/ara` and `src/app/sozluk`.
- `src/components` contains reusable UI components.
- `src/lib` holds API helpers and text utilities.
- `src/hooks` contains client hooks like autocomplete caching.
- `public` stores static assets served as-is.

## Build, Test, and Development Commands
- `npm run dev` starts the local dev server with Turbopack at `http://localhost:3000`.
- `npm run build` builds the production bundle.
- `npm run start` serves the production build locally.
- `npm run lint` runs `next lint` (ESLint with Next.js rules).

## Coding Style & Naming Conventions
- TypeScript is enabled with `strict` mode; prefer explicit types for public props and helpers.
- Follow Next.js/React conventions: `PascalCase` for components, `camelCase` for functions and variables.
- Keep route segment folder names lowercase (e.g., `src/app/ara`).
- Styling is handled with Tailwind CSS; prefer utility classes over custom CSS unless needed.

## Testing Guidelines
- No automated tests are currently configured.
- If you add tests, colocate them near the feature (e.g., `src/components/Button.test.tsx`) and document the command in this file.

## Commit & Pull Request Guidelines
- Commit history uses descriptive, sentence-style messages (e.g., “Update README.md with …”). Follow that tone and keep the first line concise.
- PRs should include a clear description, steps to validate, and screenshots for UI changes.
- Link related issues or tickets when applicable.

## Deployment & Configuration
- Production and preview deploys are handled by Vercel via GitHub Actions (`.github/workflows/preview.yaml`, `.github/workflows/production.yaml`).
- Required secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`. Do not commit secrets to the repo.
