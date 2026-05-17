# CurationFront

Frontend for the Polson Company picture curation and management application. Built with Svelte 5, TypeScript, and Vite; talks to a .NET backend API at `https://polson.com`.

## Stack

- **Svelte 5** with Runes (`$state`, `$derived`, `$effect`)
- **TypeScript** (strict mode)
- **SCSS** for styles
- **Vite** for bundling and dev server
- **Vitest** for unit and browser (Puppeteer) tests
- **Fetch API** (custom wrapper) for HTTP — no Axios

## Getting Started

All commands run from the repo root (where `package.json` lives).

```bash
npm install
npm run dev        # dev server at http://localhost:5050
```

Dev API calls proxy to `https://localhost:7212` (the local .NET backend).

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server on port 5050 |
| `npm run build` | Production build (Vite + cache-bust) |
| `npm run preview` | Preview the production build locally |
| `npm run check` | Type-check with `svelte-check` + `tsc` |
| `npm run test` | Run unit tests (`src/js/`) |
| `npm run test:run` | Run unit tests once (no watch) |
| `npm run test:browser` | Run browser/E2E tests (`src/__tests__/`) |
| `npm run test:browser:run` | Run browser tests once |
| `npm run test:follow` | Run browser tests with headed Puppeteer |
| `npm run shots` | Take screenshots via `screenshots.js` |

## Architecture

### Routing

Client-side only — no SvelteKit. [`src/stores/route-store.svelte.ts`](src/stores/route-store.svelte.ts) owns the route tree, syncs with `window.history`, and handles the back button. Pages render conditionally in [`src/App.svelte`](src/App.svelte) by mapping the current route to a component.

Routes:

| Path | Page | Access |
|---|---|---|
| `/` | Home | Public |
| `/curation` | Curation | Public |
| `/curation2` | Curation2 | Admin |
| `/picture` | Picture | Public (hidden from nav) |
| `/admin-pics` | AdminPics | Admin |
| `/admin-users` | AdminUsers | Admin |
| `/admin-dbs` | AdminDbs | Admin |
| `/testing` | Testing | Admin |

Admin routes are stripped from the nav for non-admin users.

### Auth / User State

[`src/stores/user-store.svelte.ts`](src/stores/user-store.svelte.ts) persists the session (`UserClientRemote` — token + `isAdmin`) in `localStorage` via [`src/stores/localstorage-store.svelte.ts`](src/stores/localstorage-store.svelte.ts). A 401 response from the API calls `logOut()`, which clears the store and redirects to `/curation`.

### HTTP Client

[`src/stores/fetchclient-store.svelte.ts`](src/stores/fetchclient-store.svelte.ts) wraps the browser Fetch API. It is a `$derived` store that rebuilds whenever the auth token changes, injecting a `Bearer` token header automatically. Intercepts handle 401 (log out), 403, and 429.

### API Layer

All API calls live in two files:

- [`src/js/db-ops.ts`](src/js/db-ops.ts) — public + authenticated operations (pictures, users, login, password)
- [`src/js/db-admin-ops.ts`](src/js/db-admin-ops.ts) — admin-only operations

Endpoints are relative (`/api/...`) combined with the `baseURL` global injected in `index.html`.

### Pages

| File | Description |
|---|---|
| `Home.svelte` | Landing page |
| `Curation.svelte` | Public picture gallery with carousel, modal zoom, sort toggle |
| `Curation2.svelte` | Alternate gallery view (admin) |
| `Picture.svelte` | Single picture detail view |
| `AdminPics.svelte` | Picture CRUD — file upload via drag-and-drop, edit metadata |
| `AdminUsers.svelte` | User management |
| `AdminDbs.svelte` | Database admin utilities |
| `Testing.svelte` | Dev test sandbox |

### Key Components

- **`Carousel.svelte`** — custom carousel supporting snippet-based slide and nav rendering
- **`Modal.svelte`** — full-screen image zoom overlay
- **`EditPic.svelte`** — picture metadata editor
- **`PicDrop.svelte`** — file drop zone (wraps `svelte-file-dropzone`)
- **`CleanPics.svelte`** — audit and clean orphaned/missing picture files
- **`EditUser.svelte`** / **`EditPw.svelte`** — user and password editors
- **`Menu.svelte`** / **`CurationMenu.svelte`** — navigation menus

### State Pattern

Svelte 5 Runes throughout. No writable stores from Svelte 4. Persistent state uses the `localStore` wrapper in [`src/stores/localstorage-store.svelte.ts`](src/stores/localstorage-store.svelte.ts).

## Data Models

Defined in [`src/types/models.d.ts`](src/types/models.d.ts) (auto-generated from the .NET solution):

```ts
type PictureItem = {
  id: number; fileName: string; seq: number; ts: number;
  keywords: string[]; description: string | null; link: string | null;
  isMissing: boolean; isDeleted: boolean;
}

type UserClientRemote = {
  id: number; email: string; fullName: string; token: string;
  isAdmin: boolean; hasPw: boolean; isDisabled: boolean; isDeleted: boolean;
}
```

## Build & Deployment

`npm run build` runs `vite build` then `node bust.js`. The `bust.js` script patches `dist/index.html` to:

1. Set `baseURL` to `https://polson.com`
2. Set `appIsProduction = true`
3. Append a timestamp-based version key to asset URLs for cache-busting

**Do not manually edit `dist/index.html`.**

## Tools

`tools/make-ts-models/` contains a .NET CLI tool that generates [`src/types/models.d.ts`](src/types/models.d.ts) from the C# backend models.
