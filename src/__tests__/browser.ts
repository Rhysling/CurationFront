import puppeteer, { type Browser, type Page } from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const isHeadless = process.env.HEADLESS !== 'false';

export async function launchBrowser(): Promise<Browser> {
	return puppeteer.launch({
		executablePath: CHROME_PATH,
		headless: isHeadless,
	});
}

export async function withPage<T>(fn: (page: Page) => Promise<T>): Promise<T> {
	const browser = await launchBrowser();
	try {
		const page = await browser.newPage();
		return await fn(page);
	} finally {
		await browser.close();
	}
}
