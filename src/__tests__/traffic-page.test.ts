// Requires the dev server to be running: npm run dev
// The Traffic API is mocked with request interception, so no backend is needed.
import { describe, it, expect } from 'vitest';
import type { Page, HTTPRequest } from 'puppeteer-core';
import { withPage } from './browser';

const BASE = 'http://localhost:5050';

const DAY = 86_400_000;
const now = Date.now();
const points = Array.from({ length: 30 }, (_, i) => ({
	t: now - (29 - i) * DAY,
	visitors: 20 + ((i * 7) % 15),
	pageviews: 50 + ((i * 11) % 30),
}));

const stats = (k: number) => ({ visitors: 1234 * k, visits: 1500 * k, pageviews: 4321 * k, bounceRate: 0.42, avgVisitMs: 95_000 });

const responses: Record<string, unknown> = {
	'/api/Traffic/Summary': { current: stats(1), previous: stats(0.8) },
	'/api/Traffic/TimeSeries': points,
	'/api/Traffic/Realtime': { visitors: 3 },
	'/api/Traffic/Breakdown': [
		{ key: '/curation', visitors: 900, pageviews: 2500 },
		{ key: '(direct)', visitors: 300, pageviews: 700 },
	],
};

const CORS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'Authorization, Content-Type',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

async function mockApi(page: Page) {
	await page.setRequestInterception(true);
	page.on('request', (req: HTTPRequest) => {
		const url = new URL(req.url());
		const body = responses[url.pathname];
		if (url.pathname.startsWith('/api/')) {
			if (req.method() === 'OPTIONS') return req.respond({ status: 204, headers: CORS });
			return req.respond({
				status: body ? 200 : 404,
				headers: CORS,
				contentType: 'application/json',
				body: JSON.stringify(body ?? {}),
			});
		}
		req.continue();
	});
}

async function loginAsAdmin(page: Page) {
	await page.evaluateOnNewDocument(() => {
		localStorage.setItem('user', JSON.stringify({
			id: 1, email: 'admin@test', fullName: 'Admin', token: 'fake-token',
			isAdmin: true, hasPw: true, isDisabled: false, isDeleted: false,
		}));
	});
}

describe('Traffic page — browser smoke tests', () => {
	it('falls back to Home for non-admins', async () => {
		await withPage(async (page) => {
			await page.goto(`${BASE}/traffic`);
			await page.waitForFunction(() => document.title.startsWith('Polson-'), { timeout: 5000 });
			expect(await page.title()).toBe('Polson-Home');
		});
	}, 15000);

	it('renders all four tabs with data for an admin', async () => {
		await withPage(async (page) => {
			await mockApi(page);
			await loginAsAdmin(page);
			await page.goto(`${BASE}/traffic`);

			await page.waitForSelector('[role="tab"]', { timeout: 5000 });
			const tabs = await page.$$eval('[role="tab"]', (els) => els.map((e) => e.textContent?.trim()));
			expect(tabs).toEqual(['Overview', 'Content', 'Sources', 'Audience']);

			// Overview: KPI tiles and the chart
			await page.waitForFunction(() => document.body.innerText.includes('1,234'), { timeout: 5000 });
			expect(await page.$('.chart svg path')).not.toBeNull();

			for (const [id, title] of [['content', 'Top pages'], ['sources', 'Referrers'], ['audience', 'Browsers']]) {
				await page.click(`#tab-${id}`);
				await page.waitForFunction((t) => document.body.innerText.includes(t), { timeout: 5000 }, title);
				expect(new URL(page.url()).searchParams.get('tab')).toBe(id);
			}
		});
	}, 20000);
});
