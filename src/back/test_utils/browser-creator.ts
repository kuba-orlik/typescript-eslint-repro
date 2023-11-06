import { Browser, firefox } from "@playwright/test";

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
