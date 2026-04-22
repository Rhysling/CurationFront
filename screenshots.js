import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'fs';
import { join } from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const VIEWPORTS = [
	{ name: 'desktop', width: 1440, height: 900 },
	{ name: 'mobile', width: 390, height: 844 },
];

const PAGES = [
	{ name: 'dramatic-arts', url: 'http://localhost:5050/curation?p=dramatic-arts' },
	{ name: 'london',        url: 'http://localhost:5050/curation?p=london' },
];

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const outDir = join('screenshots', timestamp);
mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({
	executablePath: CHROME_PATH,
	headless: true,
});

for (const vp of VIEWPORTS) {
	const page = await browser.newPage();
	await page.setViewport({ width: vp.width, height: vp.height });

	for (const pg of PAGES) {
		await page.goto(pg.url, { waitUntil: 'networkidle2', timeout: 15000 });
		const file = join(outDir, `${pg.name}-${vp.name}.png`);
		await page.screenshot({ path: file, fullPage: false });
		console.log(`Saved: ${file}`);
	}

	await page.close();
}

await browser.close();
