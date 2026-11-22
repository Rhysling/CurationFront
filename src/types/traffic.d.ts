// Traffic analytics types. Hand-written (not generated): keep in sync with
// docs/traffic-backend.md.

// Payload sent to POST /api/Traffic/Collect.
type TrafficEventIn = {
	type: "pageview" | "leave" | "event";
	v: number;
	pvId: string;
	path?: string;
	page?: string;
	pic?: string;
	keyword?: string;
	ref?: string;
	utmSource?: string;
	utmMedium?: string;
	utmCampaign?: string;
	sw?: number;
	lang?: string;
	durationMs?: number;
	name?: string;
	props?: Record<string, JsonValue>;
};

// Half-open [from, to) in unix ms; tzOffsetMin = minutes east of UTC.
type TrafficRange = {
	from: number;
	to: number;
	tzOffsetMin: number;
};

type TrafficRangeKey = "24h" | "7d" | "30d" | "90d" | "12m";

type TrafficInterval = "hour" | "day" | "month";

type TrafficStats = {
	visitors: number;
	visits: number;
	pageviews: number;
	bounceRate: number; // 0..1
	avgVisitMs: number;
};

type TrafficSummary = {
	current: TrafficStats;
	previous: TrafficStats;
};

type TrafficPoint = {
	t: number; // bucket start, unix ms
	visitors: number;
	pageviews: number;
};

type TrafficBreakdownRow = {
	key: string;
	visitors: number;
	pageviews: number;
};

type TrafficDimension =
	| "page"
	| "entry"
	| "picture"
	| "keyword"
	| "referrer"
	| "utmSource"
	| "utmMedium"
	| "utmCampaign"
	| "browser"
	| "os"
	| "device"
	| "screen"
	| "lang"
	| "country";

type TrafficRealtime = {
	visitors: number;
};
