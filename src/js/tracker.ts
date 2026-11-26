// Cookieless traffic collection. See docs/traffic-backend.md for the server side.
//
// - Sends with a bare beacon/fetch (never getFetchClient): no token goes out and a
//   401 can never log anyone out.
// - Skips admins and automated browsers (navigator.webdriver) entirely.
// - Imports only user-store. route-store passes path/page/params in, so this module
//   must never import route-store (import cycle).
// - Never throws: tracking failures are swallowed.

import { user } from "../stores/user-store.svelte";

declare var baseURL: string;

const SCHEMA_VERSION = 1;
const COLLECT_PATH = "/api/Traffic/Collect";

let currentPvId: string | null = null;
let visibleMs = 0;
let visibleSince: number | null = null;
let isFirstPageview = true;
let listenersAttached = false;

const isTrackingDisabled = (): boolean => {
	try {
		return !!user.value?.isAdmin || !!navigator.webdriver;
	} catch {
		return true;
	}
};

const newId = (): string => {
	try {
		if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
	} catch { /* fall through */ }
	return Math.random().toString(36).slice(2) + Date.now().toString(36);
};

const send = (payload: TrafficEventIn) => {
	if (isTrackingDisabled()) return;
	try {
		const url = `${baseURL}${COLLECT_PATH}`;
		// A string body is sent as text/plain: a CORS-simple request with no preflight.
		const body = JSON.stringify(payload);
		const sent = typeof navigator.sendBeacon === "function" && navigator.sendBeacon(url, body);
		if (!sent) {
			globalThis.fetch(url, { method: "POST", body, keepalive: true, mode: "no-cors" })
				.catch(() => { /* ignore */ });
		}
	} catch {
		/* tracking must never break the app */
	}
};

const isVisible = () => document.visibilityState === "visible";

const getVisibleMs = (now = Date.now()) =>
	visibleMs + (visibleSince !== null ? now - visibleSince : 0);

const startTimer = () => {
	visibleMs = 0;
	visibleSince = isVisible() ? Date.now() : null;
};

const sendLeave = () => {
	if (!currentPvId) return;
	send({ type: "leave", v: SCHEMA_VERSION, pvId: currentPvId, durationMs: getVisibleMs() });
};

const onVisibilityChange = () => {
	if (isVisible()) {
		if (visibleSince === null) visibleSince = Date.now();
	} else {
		// Bank the visible time, then report it. The server keeps the max, so
		// repeated leaves for the same pageview are harmless.
		visibleMs = getVisibleMs();
		visibleSince = null;
		sendLeave();
	}
};

const attachListeners = () => {
	if (listenersAttached) return;
	listenersAttached = true;
	document.addEventListener("visibilitychange", onVisibilityChange);
	window.addEventListener("pagehide", sendLeave);
};

const nonEmpty = (s: string | null | undefined) => (s ? s : undefined);

export const trackPageview = (path: string, page: string, params: Record<string, string> = {}) => {
	try {
		attachListeners();

		// Close out the previous SPA pageview.
		sendLeave();

		currentPvId = newId();
		startTimer();

		const payload: TrafficEventIn = {
			type: "pageview",
			v: SCHEMA_VERSION,
			pvId: currentPvId,
			path,
			page,
			pic: nonEmpty(params["p"]),
			keyword: nonEmpty(params["kw"]?.trim().toLowerCase()),
			sw: window.innerWidth,
			lang: navigator.language,
		};

		// Referrer and campaign tags only describe how the visitor arrived.
		if (isFirstPageview) {
			payload.ref = nonEmpty(document.referrer);
			payload.utmSource = nonEmpty(params["utm_source"]);
			payload.utmMedium = nonEmpty(params["utm_medium"]);
			payload.utmCampaign = nonEmpty(params["utm_campaign"]);
			isFirstPageview = false;
		}

		send(payload);
	} catch {
		/* ignore */
	}
};

// For future granular events (pic_view, keyword_search, ...). The backend keeps a
// whitelist of names, so new names need a server change too.
export const trackEvent = (name: string, props: Record<string, JsonValue> = {}) => {
	try {
		send({ type: "event", v: SCHEMA_VERSION, pvId: currentPvId ?? "", name, props });
	} catch {
		/* ignore */
	}
};

// Test-only: reset module state between tests.
export const _resetTrackerForTests = () => {
	currentPvId = null;
	visibleMs = 0;
	visibleSince = null;
	isFirstPageview = true;
};
