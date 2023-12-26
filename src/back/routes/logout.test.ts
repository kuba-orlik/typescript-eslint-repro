import assert from "assert";
import { Browser, BrowserContext, Page } from "@playwright/test";
import ADMIN_CREDENTIALS from "../default-admin-credentials.js";
import { getBrowser } from "../test_utils/browser-creator.js";
import { LONG_TEST_TIMEOUT, VERY_LONG_TEST_TIMEOUT } from "../test_utils/webhint.js";
import { withProdApp } from "../test_utils/with-prod-app.js";
import { LogoutURL, SignInURL } from "./urls.js";

describe("Logout", () => {
	let page: Page;
	let browser: Browser;
	let context: BrowserContext;
	const username = ADMIN_CREDENTIALS.username;
	const password = ADMIN_CREDENTIALS.password;

	beforeEach(async () => {
		browser = await getBrowser();
		context = await browser.newContext();
		page = await context.newPage();
	});

	afterEach(async () => {
		await context.close();
	});

	it("doesn't crash", async function () {
		this.timeout(VERY_LONG_TEST_TIMEOUT);
		return withProdApp(async ({ rest_api }) => {
			await assert.rejects(
				async () => {
					await rest_api.get(LogoutURL);
				},
				{ name: "Error" }
			);
		});
	});

	describe("logout test", () => {
		it("logout", async function () {
			await withProdApp(async ({ base_url }) => {
				this.timeout(LONG_TEST_TIMEOUT);
				await page.goto(base_url);
				await page.getByRole("link", { name: "Sign in" }).click();
				await page.getByPlaceholder("text").click();
				await page.getByPlaceholder("text").fill(username);
				await page.getByPlaceholder("text").press("Tab");
				await page.getByPlaceholder("password").fill(password);
				await page.getByPlaceholder("password").press("Enter");
				await page.waitForSelector(`a[href="${LogoutURL}"]`);
				await page.getByRole("link", { name: "Logout" }).click();
				await page.waitForSelector(`a[href="${SignInURL}"]`);
			});
		});
	});
});
