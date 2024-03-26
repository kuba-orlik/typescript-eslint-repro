import assert from "assert";
import { Browser, BrowserContext, Page } from "@playwright/test";
import ADMIN_CREDENTIALS from "../default-admin-credentials.js";
import { getBrowser } from "../test_utils/browser-creator.js";
import { LONG_TEST_TIMEOUT, VERY_LONG_TEST_TIMEOUT } from "../test_utils/webhint.js";
import { withProdApp } from "../test_utils/with-prod-app.js";
import { SignInURL, TodoURL } from "./urls.js";

describe("Todo webhint", () => {
	it(
		"doesn't crash",
		async function () {
			return withProdApp(async ({ rest_api }) => {
				await assert.rejects(
					async () => {
						await rest_api.get(TodoURL);
					},
					{
						response: {
							data: "no access",
							status: 403,
						},
					}
				);
			});
		},
		VERY_LONG_TEST_TIMEOUT
	);
});

describe("Todo", function () {
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

	describe("todo test", () => {
		it(
			"create and delete task",
			async function () {
				await withProdApp(async ({ base_url }) => {
					await page.goto(base_url);
					await page.getByRole("link", { name: "Sign in" }).click();
					await page.getByPlaceholder("text").click();
					await page.getByPlaceholder("text").fill(username);
					await page.getByPlaceholder("text").press("Tab");
					await page.getByPlaceholder("password").fill(password);
					await page.getByPlaceholder("password").press("Enter");
					await page.getByRole("link", { name: "To do app" }).click();
					await page.getByPlaceholder("Write an Matrix bot").click();
					await page
						.getByPlaceholder("Write an Matrix bot")
						.fill("randomtasdk");
					await page.getByRole("button", { name: "Wyślij" }).click();
					await page.waitForSelector(".form-message.form-message--success");
					await page.locator("turbo-frame").getByRole("checkbox").check();
					await page.locator("turbo-frame").getByRole("checkbox").uncheck();
					await page
						.locator("turbo-frame")
						.getByRole("button", { name: "Delete" })
						.click();
					await page.getByRole("link", { name: "Logout" }).click();
					await page.waitForSelector(`a[href="${SignInURL}"]`);
				});
			},
			VERY_LONG_TEST_TIMEOUT
		);
	});

	describe("can access test", () => {
		it(
			"access url",
			async function () {
				await withProdApp(async ({ base_url }) => {
					await page.goto(base_url);
					try {
						await page.waitForSelector(`a[href="${SignInURL}"]`);
						await page.goto(base_url + TodoURL);
						await page.waitForSelector('body:has-text("no access")');
					} catch (error) {
						console.error(error);
					}
				});
			},
			LONG_TEST_TIMEOUT
		);
	});
});
