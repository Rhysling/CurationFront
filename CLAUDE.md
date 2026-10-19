# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from the repo root (where `package.json` lives):

- `npm run dev` — start dev server on port 5050
- `npm run build` — production build (`vite build` → `node bust.js`)
- `npm run check` — type-check with `svelte-check` + `tsc`
- `npm run preview` — preview production build locally
- `npm run test` / `npm run test:run` — Vitest unit tests in `src/js/` (watch / single run)
- `npm run test:browser` / `npm run test:browser:run` — Puppeteer smoke tests in `src/__tests__/`. Require `npm run dev` running and Chrome at `C:\Program Files\Google\Chrome\Application\chrome.exe`
- `npm run test:follow` — browser tests with a visible (headed) browser
- `npm run shots` — screenshots via `screenshots.js` (also needs the dev server)

Run a single unit test file: `npx vitest --run src/js/utils.test.ts`

## Architecture

**Stack:** Svelte 5 (runes only — no Svelte 4 stores), TypeScript (strict), SCSS, Vite, Vitest (jsdom) + puppeteer-core. HTTP uses a custom Fetch wrapper — there is no Axios.

**Routing:** Client-side only (no SvelteKit). [src/stores/route-store.svelte.ts](src/stores/route-store.svelte.ts) owns the route tree, syncs with `window.history`, and handles the back button. For non-admins the admin routes are filtered out of the tree, so an admin path falls back to Home. [src/App.svelte](src/App.svelte) maps the current route's `page` to a component.

**Query-string state:** Use `updateQueryStringParam(key, value)` to keep the URL in sync — it uses `replaceState` (no history entry) and updates `pageState.paramObj`; pass `undefined` to remove a param. Params in use: `p` (picture slug), `keyword`, `newest`, `pid` (admin scroll target). `pageState.isNavFromUrl` marks navigation that came from the URL/back button so effects don't echo it back.

**Slugs:** A picture's slug is its file name minus extension — always use `getSlug()` from [src/js/utils.ts](src/js/utils.ts) and match exactly (a prefix match makes `cuisine` resolve to `cuisine-popularity.png`).

**Auth / user state:** [src/stores/user-store.svelte.ts](src/stores/user-store.svelte.ts) persists the session (`UserClientRemote`: token + `isAdmin`) in `localStorage` via [src/stores/localstorage-store.svelte.ts](src/stores/localstorage-store.svelte.ts). `getEmptyUser` is defined there (re-exported from utils) because the store calls it at module load and `utils → route-store → user-store` is an import cycle — don't move it into utils.

**HTTP client:** [src/stores/fetchclient-store.svelte.ts](src/stores/fetchclient-store.svelte.ts) is a `$derived` fetch wrapper (`getFetchClient()`) rebuilt when the token changes; it injects the Bearer header. Intercepts: 401 → `logOut()` (clears session, navigates to `/curation`), 403/429 → console warning. `postLogin` deliberately uses bare `fetch` so a wrong password's 401 doesn't trigger logout.

**API layer:** [src/js/db-ops.ts](src/js/db-ops.ts) (pictures, users, login, testing) and [src/js/db-admin-ops.ts](src/js/db-admin-ops.ts) (DB backup/restore). Conventions:
- Call `ensureOk(response)` and `await` the body inside the `try`, so error responses and parse failures land in the `catch`.
- On failure, functions log with `console.error` and return `undefined` — callers check for a falsy result and show an `alert`.
- Exceptions: `postSaveUser`/`postDestroyUser` return the server's 400 text as a validation message; `postDestroyPic` returns the raw `Response`.
- Endpoints are `/api/...` prefixed with the `baseURL` global from `index.html` (dev `https://localhost:7212`, production `https://polson.com`).

**Keywords:** `mapKeywordsAll` builds `keywordsAll` from a picture's keywords, file name and title — all lowercased with empties removed. `getKeywordsList` gives the sorted unique list used for autocomplete in `CurationMenu`. Keyword matching is exact against lowercase, so lowercase user input before filtering.

**Pages** ([src/pages/](src/pages/)):
- `Curation` — public carousel with keyword filter/autocomplete, sort toggle and modal zoom.
- `Picture` (`/picture?p=slug`, hidden from nav) — single picture with zoom/pan.
- `Curation2` — admin grid view linking to edit.
- `AdminPics` (CRUD + upload via svelte-file-dropzone), `AdminUsers`, `AdminDbs` — admin-only.
- `Testing` — admin-only sandbox; intentionally kept.

**Components:** `carousel/Carousel.svelte` is a custom snippet-based carousel (its window ←/→ handler skips form fields). `Modal.svelte` closes on Escape via a window listener unless `disableHideModal`. `EditPic`/`EditUser` keep a local copy of the row and re-sync it from props via `$effect` except while editing.

**Types:** Ambient global types live in [src/types/](src/types/) — `models.d.ts` is generated from the .NET backend (`tools/make-ts-models/`, gitignored); `main.d.ts` holds frontend types.

## Gotchas

- **Vite config:** only `vite.config.ts` should exist. Vite loads `vite.config.js` before `.ts`, so a stray emitted `.js` would silently override it for dev/build. `tsconfig.node.json` sends its declaration output to `node_modules/.tmp/` for this reason.
- **Svelte 5 touch events:** `ontouchstart`/`ontouchmove` handlers are passive, so `preventDefault()` is ignored — use CSS `touch-action` instead.
- **Build:** `bust.js` patches `dist/index.html` after `vite build`: it sets `baseURL` to production, `appIsProduction = true`, and `appVersionKey` to a timestamp. Running `vite build` alone leaves a dev-configured `dist/`. Do not manually edit `dist/index.html`. `bust.js` uses Windows paths.
