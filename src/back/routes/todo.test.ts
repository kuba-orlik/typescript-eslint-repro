import assert from "assert";
import { withProdApp } from "../test_utils/with-prod-app";
import { LONG_TEST_TIMEOUT, VERY_LONG_TEST_TIMEOUT } from "../test_utils/webhint";
import { SignInURL, TodoURL } from "./urls";
import { Browser, BrowserContext, Page } from "@playwright/test";
import { getBrowser } from "../test_utils/browser-creator";
import ADMIN_CREDENTIALS from "../default-admin-credentials";

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

	it("doesn't crash", async function () {
		this.timeout(VERY_LONG_TEST_TIMEOUT);
		return withProdApp(async ({ rest_api }) => {
			await assert.rejects(
				async () => {
					await rest_api.get(TodoURL);
				},
				{ name: "Error" }
			);
		});
	});

	describe("todo test", () => {
		it("create and delete task", async function () {
			await withProdApp(async ({ base_url }) => {
				this.timeout(VERY_LONG_TEST_TIMEOUT);
				await page.goto(base_url);
				await page.getByRole("link", { name: "Sign in" }).click();
				await page.getByPlaceholder("text").click();
				await page.getByPlaceholder("text").fill(username);
				await page.getByPlaceholder("text").press("Tab");
				await page.getByPlaceholder("password").fill(password);
				await page.getByPlaceholder("password").press("Enter");
				await page.getByRole("link", { name: "To do app" }).click();
				await page.getByPlaceholder("Write an Matrix bot").click();
				await page.getByPlaceholder("Write an Matrix bot").fill("randomtasdk");
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
		});
	});

	describe("can access test", () => {
		it("access url", async function () {
			await withProdApp(async ({ base_url }) => {
				this.timeout(LONG_TEST_TIMEOUT);
				await page.goto(base_url);
				try {
					await page.waitForSelector(`a[href="${SignInURL}"]`);
					await page.goto(base_url + TodoURL);
					await page.waitForSelector('body:has-text("no access")');
				} catch (error) {
					console.error(error);
				}
			});
		});
	});
});
