export type BreakdownSection = {
	dimension: TrafficDimension;
	title: string;
	keyLabel?: string;
	formatKey?: (key: string) => string;
	hideIfEmpty?: boolean;
};

export const fmtInt =(n: number | undefined) => (n === undefined ? "–" : Math.round(n).toLocaleString());

export const fmtPct = (r: number | undefined) => (r === undefined ? "–" : `${Math.round(r * 100)}%`);

export const fmtDuration = (ms: number | undefined) => {
	if (ms === undefined) return "–";
	const s = Math.round(ms / 1000);
	if (s < 60) return `${s}s`;
	const m = Math.floor(s / 60);
	if (m < 60) return `${m}m ${s % 60}s`;
	return `${Math.floor(m / 60)}h ${m % 60}m`;
};

export const fmtRatio = (n: number | undefined, d: number | undefined) =>
	n === undefined || !d ? "–" : (n / d).toFixed(1);

// Range keys → [from, to) aligned to local boundaries, plus the chart interval.
export const RANGES: { key: TrafficRangeKey; label: string }[] = [
	{ key: "24h", label: "24 hours" },
	{ key: "7d", label: "7 days" },
	{ key: "30d", label: "30 days" },
	{ key: "90d", label: "90 days" },
	{ key: "12m", label: "12 months" },
];

export const intervalFor = (key: TrafficRangeKey): TrafficInterval =>
	key === "24h" ? "hour" : key === "12m" ? "month" : "day";

export const computeRange = (key: TrafficRangeKey, now = new Date()): TrafficRange => {
	const from = new Date(now);
	if (key === "24h") {
		from.setMinutes(0, 0, 0);
		from.setHours(from.getHours() - 23);
	} else if (key === "12m") {
		from.setHours(0, 0, 0, 0);
		from.setDate(1);
		from.setMonth(from.getMonth() - 11);
	} else {
		const days = key === "7d" ? 7 : key === "30d" ? 30 : 90;
		from.setHours(0, 0, 0, 0);
		from.setDate(from.getDate() - (days - 1));
	}
	return { from: from.getTime(), to: now.getTime(), tzOffsetMin: -now.getTimezoneOffset() };
};
