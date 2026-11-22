import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockUser = vi.hoisted(() => ({ value: { isAdmin: false } as { isAdmin: boolean } }));

vi.mock('../stores/user-store.svelte', () => ({
	user: mockUser,
}));

import { trackPageview, trackEvent, _resetTrackerForTests } from './tracker';

const beacon = vi.fn();

const sentPayloads = (): TrafficEventIn[] =>
	beacon.mock.calls.map((c) => JSON.parse(c[1] as string));

let visibility: DocumentVisibilityState = 'visible';

const setVisibility = (v: DocumentVisibilityState) => {
	visibility = v;
	document.dispatchEvent(new Event('visibilitychange'));
};

describe('tracker', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		(globalThis as any).baseURL = 'https://api.test';
		beacon.mockReset();
		beacon.mockReturnValue(true);
		Object.defineProperty(navigator, 'sendBeacon', { value: beacon, configurable: true, writable: true });
		Object.defineProperty(navigator, 'webdriver', { value: false, configurable: true });
		Object.defineProperty(document, 'visibilityState', { get: () => visibility, configurable: true });
		Object.defineProperty(document, 'referrer', { value: 'https://www.google.com/search?q=x', configurable: true });
		visibility = 'visible';
		mockUser.value = { isAdmin: false };
		_resetTrackerForTests();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('sends a pageview to the collect endpoint with the expected shape', () => {
		trackPageview('/curation', 'Curation', { p: 'sunset', keyword: ' Food ' });

		expect(beacon).toHaveBeenCalledTimes(1);
		expect(beacon.mock.calls[0][0]).toBe('https://api.test/api/Traffic/Collect');
		const [pv] = sentPayloads();
		expect(pv).toMatchObject({
			type: 'pageview',
			v: 1,
			path: '/curation',
			page: 'Curation',
			pic: 'sunset',
			keyword: 'food',
		});
		expect(typeof pv.pvId).toBe('string');
		expect(pv.pvId.length).toBeGreaterThan(0);
	});

	it('sends referrer and UTM tags only on the first pageview', () => {
		trackPageview('/', 'Home', { utm_source: 'news', utm_medium: 'email', utm_campaign: 'fall' });
		trackPageview('/curation', 'Curation', { utm_source: 'news' });

		const pvs = sentPayloads().filter((p) => p.type === 'pageview');
		expect(pvs[0]).toMatchObject({
			ref: 'https://www.google.com/search?q=x',
			utmSource: 'news',
			utmMedium: 'email',
			utmCampaign: 'fall',
		});
		expect(pvs[1].ref).toBeUndefined();
		expect(pvs[1].utmSource).toBeUndefined();
	});

	it('sends a leave for the previous pageview on SPA navigation', () => {
		trackPageview('/', 'Home');
		const firstId = sentPayloads()[0].pvId;
		vi.advanceTimersByTime(4000);
		trackPageview('/curation', 'Curation');

		const [, leave, pv2] = sentPayloads();
		expect(leave).toMatchObject({ type: 'leave', pvId: firstId, durationMs: 4000 });
		expect(pv2.type).toBe('pageview');
		expect(pv2.pvId).not.toBe(firstId);
	});

	it('counts only visible time and reports a leave when the page is hidden', () => {
		trackPageview('/', 'Home');
		vi.advanceTimersByTime(2000);
		setVisibility('hidden');
		vi.advanceTimersByTime(10000);
		setVisibility('visible');
		vi.advanceTimersByTime(1000);
		trackPageview('/curation', 'Curation');

		const leaves = sentPayloads().filter((p) => p.type === 'leave');
		expect(leaves.map((l) => l.durationMs)).toEqual([2000, 3000]);
	});

	it('sends nothing for admins', () => {
		mockUser.value = { isAdmin: true };
		trackPageview('/', 'Home');
		trackEvent('pic_view', { slug: 'a' });
		expect(beacon).not.toHaveBeenCalled();
	});

	it('sends nothing for automated browsers', () => {
		Object.defineProperty(navigator, 'webdriver', { value: true, configurable: true });
		trackPageview('/', 'Home');
		expect(beacon).not.toHaveBeenCalled();
	});

	it('falls back to fetch when sendBeacon is unavailable', () => {
		Object.defineProperty(navigator, 'sendBeacon', { value: undefined, configurable: true, writable: true });
		const fetchMock = vi.fn().mockResolvedValue({});
		vi.stubGlobal('fetch', fetchMock);

		trackPageview('/', 'Home');

		expect(fetchMock).toHaveBeenCalledWith(
			'https://api.test/api/Traffic/Collect',
			expect.objectContaining({ method: 'POST', keepalive: true, mode: 'no-cors' }),
		);
		vi.unstubAllGlobals();
	});

	it('never throws when sending fails', () => {
		beacon.mockImplementation(() => { throw new Error('boom'); });
		vi.stubGlobal('fetch', () => { throw new Error('boom'); });
		expect(() => trackPageview('/', 'Home')).not.toThrow();
		expect(() => trackEvent('x')).not.toThrow();
		vi.unstubAllGlobals();
	});
});
