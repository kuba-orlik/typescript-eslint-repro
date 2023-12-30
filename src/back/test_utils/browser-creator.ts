import { Browser, BrowserContext, firefox, Page } from "@playwright/test";

let browser: Browser;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function getBrowser(): Promise<Browser> {
	if (!browser) browser = await firefox.launch();
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	return browser;
}

export async function closeBrowser() {
	if (browser) {
		await browser.close();
	}
}

export async function getPage(): Promise<{
	page: Page;
	browser: Browser;
	context: BrowserContext;
}> {
	const browser = await getBrowser();
	const context = await browser.newContext();
	const page = await context.newPage();
	return { browser, context, page };
}
