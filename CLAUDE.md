# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from `src/`:

- `npm run dev` — start dev server on port 5050
- `npm run build` — production build (`vite build` → `node bust.js` for cache-busting)
- `npm run check` — type-check with `svelte-check` + `tsc`
- `npm run preview` — preview production build locally

No test runner is configured.

## Architecture

**Stack:**
- Svelte 5 with runes ($state, $derived, $effect)
- TypeScript (strict mode)
- SCSS + Axios
- Vite for bundling
- Vitest for unit and integration testing
- Vitest + vitest-puppeteer for E2E testing / browser automation

**Routing:** Client-side only. [src/stores/route-store.svelte.ts](src/stores/route-store.svelte.ts) owns the routing tree, syncs with `window.history`, and enforces `isAdmin` guards on protected routes. Pages are rendered conditionally in [src/App.svelte](src/App.svelte) based on the active route.

**Auth / User State:** [src/stores/user-store.svelte.ts](src/stores/user-store.svelte.ts) persists session (token + `isAdmin`) in `localStorage`. The HTTP client in [src/stores/httpclient-store.svelte.ts](src/stores/httpclient-store.svelte.ts) is a derived Axios instance that injects the Bearer token and redirects to login on 401.

**API calls:** All API operations live in [src/js/db-ops.ts](src/js/db-ops.ts) (public) and [src/js/db-admin-ops.ts](src/js/db-admin-ops.ts) (admin). They consume the httpclient store and call `/api/` endpoints. The `baseURL` global is injected into `index.html` — dev points to `https://localhost:7212`, production to `https://polson.com`.

**State pattern:** Svelte 5 Runes throughout (`$state`, `$derived`, `$effect`). Persistent state is wrapped via [src/stores/localstorage-store.svelte.ts](src/stores/localstorage-store.svelte.ts).

**Pages:** [src/pages/](src/pages/) — `Curation` and `Curation2` are gallery views with carousel/modal zoom; `AdminPics` handles picture CRUD with file upload (svelte-file-dropzone); `AdminUsers` and `AdminDbs` are admin-only.

**Build note:** `bust.js` patches `index.html` after `vite build` — it sets `appIsProduction=true` and appends a version key to asset URLs. Do not manually edit `dist/index.html`.
