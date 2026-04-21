// Requires the dev server to be running: npm run dev
import { describe, it, expect } from 'vitest';
import { withPage } from './browser';

const BASE = 'http://localhost:5050';

describe('Curation app — browser smoke tests', () => {
	it('sets page title to Polson-Home after mount', async () => {
		await withPage(async (page) => {
			await page.goto(BASE);
			// navFromUrl() runs in onMount and updates document.title
			await page.waitForFunction(
				() => document.title.startsWith('Polson-'),
				{ timeout: 5000 }
			);
			expect(await page.title()).toBe('Polson-Home');
		});
	}, 15000);
});
