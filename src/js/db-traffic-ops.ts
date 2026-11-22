import { getFetchClient as fc } from "../stores/fetchclient-store.svelte";
import { ensureOk } from "./db-ops";

// Traffic reports (admin-only). Collection lives in tracker.ts.

const rangeParams = (range: TrafficRange) => ({
	from: String(range.from),
	to: String(range.to),
	tzOffsetMin: String(range.tzOffsetMin),
});

export const getTrafficSummary = async (range: TrafficRange) => {
	try {
		const response: Response = await fc().get(`/api/Traffic/Summary?${new URLSearchParams(rangeParams(range))}`);
		return (await ensureOk(response).json()) as TrafficSummary;
	} catch (error) {
		console.error(error);
	}
};

export const getTrafficTimeSeries = async (range: TrafficRange, interval: TrafficInterval) => {
	try {
		const qs = new URLSearchParams({ ...rangeParams(range), interval });
		const response: Response = await fc().get(`/api/Traffic/TimeSeries?${qs}`);
		return (await ensureOk(response).json()) as TrafficPoint[];
	} catch (error) {
		console.error(error);
	}
};

export const getTrafficBreakdown = async (range: TrafficRange, dimension: TrafficDimension, limit = 50) => {
	try {
		const qs = new URLSearchParams({ ...rangeParams(range), dimension, limit: String(limit) });
		const response: Response = await fc().get(`/api/Traffic/Breakdown?${qs}`);
		return (await ensureOk(response).json()) as TrafficBreakdownRow[];
	} catch (error) {
		console.error(error);
	}
};

export const getTrafficRealtime = async () => {
	try {
		const response: Response = await fc().get(`/api/Traffic/Realtime`);
		return (await ensureOk(response).json()) as TrafficRealtime;
	} catch (error) {
		console.error(error);
	}
};
