# Phase 4 Deployment Readiness

Date: 2026-05-21

## Target

GitHub Pages project site published from the repository root:

`https://<username>.github.io/movie-mood-picker/`

## Readiness Result

Status: ready after API keys are configured.

The static app is suitable for GitHub Pages because:
- `index.html` is at the repository root.
- The app uses browser-native ES modules with relative imports.
- The root script tag uses `./src/main.js`, which works under a GitHub Pages project path.
- Local module imports include `v=20260521b` cache-busting query strings to avoid stale browser module graphs after static deploy updates.
- No build step, package install, CI, or extra dependency is required.
- `.nojekyll` is present so GitHub Pages serves files as plain static assets.

## Checks Performed

- Checked for root-relative asset paths that would break under `/movie-mood-picker/`.
- Checked for committed real-looking API secrets.
- Checked that Groq and TMDb keys are still placeholders.
- Checked current branch: `main`.
- Checked Git remote configuration: no remote is configured in this local repo.
- Re-ran browser responsive verification as part of Phase 4.

## Fixes Applied

- Added `.nojekyll`.
- Updated `README.md` with local server instructions and GitHub Pages deployment steps.
- Added explicit placeholder-key guards in:
  - `src/groqService.js`
  - `src/tmdbService.js`
- Added cache-busting query strings to local ES module imports.

## Remaining Manual Steps

1. Replace `<YOUR_GROQ_API_KEY>` in `src/groqService.js`.
2. Replace `<YOUR_TMDB_API_KEY>` in `src/tmdbService.js`.
   Paste only the key value, without the surrounding angle brackets.
3. Add a GitHub remote if this local repo is not connected yet.
4. Push the project to GitHub.
5. Enable GitHub Pages from `main` / `/ (root)`.
6. Open the public URL and verify mood selection, movie cards, modal, and responsive behavior.

## Notes

The app intentionally keeps API keys in client code for MVP simplicity. Only use free-tier keys with quota limits for public GitHub Pages deployment.
