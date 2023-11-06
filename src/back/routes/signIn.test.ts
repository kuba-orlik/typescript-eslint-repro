import { withProdApp } from "../test_utils/with-prod-app";
import { VERY_LONG_TEST_TIMEOUT, webhintURL } from "../test_utils/webhint";
import { SignInURL, LogoutURL } from "./urls";
import { Browser, BrowserContext, Page } from "@playwright/test";
import { getBrowser } from "../test_utils/browser-creator";
import ADMIN_CREDENTIALS from "../default-admin-credentials";

describe("SignIn", () => {
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
		return withProdApp(async ({ base_url, rest_api }) => {
			await rest_api.get(SignInURL);
			await webhintURL(base_url + SignInURL);
			// alternatively you can use webhintHTML for faster but less precise scans
			// or for scanning responses of requests that use some form of authorization:
			// const response = await rest_api.get(SignInURL);
			// await webhintHTML(response);
		});
	});

	describe("can access test", () => {
		it("access url", async function () {
			await withProdApp(async ({ base_url }) => {
				this.timeout(VERY_LONG_TEST_TIMEOUT);
				await page.goto(base_url);
				await page.getByRole("link", { name: "Sign in" }).click();
				await page.getByPlaceholder("text").click();
				await page.getByPlaceholder("text").fill(username);
				await page.getByPlaceholder("text").press("Tab");
				await page.getByPlaceholder("password").fill(password);
				await page.getByPlaceholder("password").press("Enter");
				await page.waitForSelector(`a[href="${LogoutURL}"]`);
				await page.goto(base_url + SignInURL);
				await page.waitForSelector('body:has-text("no access")');
				await page.goto(base_url);
				await page.getByRole("link", { name: "Logout" }).click();
				await page.waitForSelector(`a[href="${SignInURL}"]`);
			});
		});
	});

	describe("sign in test", () => {
		it("wrong username", async function () {
			await withProdApp(async ({ base_url }) => {
				this.timeout(VERY_LONG_TEST_TIMEOUT);
				await page.goto(base_url);
				await page.getByRole("link", { name: "Sign in" }).click();
				await page.getByPlaceholder("text").click();
				await page.getByPlaceholder("text").fill("username20230720722");
				await page.getByPlaceholder("text").press("Tab");
				await page.getByPlaceholder("password").fill("test");
				await page.getByPlaceholder("password").press("Enter");
				await page.waitForSelector(".form-message");
			});
		});

		it("correct username and password", async function () {
			await withProdApp(async ({ base_url }) => {
				this.timeout(VERY_LONG_TEST_TIMEOUT);
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

		it("wrong password", async function () {
			await withProdApp(async ({ base_url }) => {
				this.timeout(VERY_LONG_TEST_TIMEOUT);
				await page.goto(base_url);
				await page.getByRole("link", { name: "Sign in" }).click();
				await page.getByPlaceholder("text").click();
				await page.getByPlaceholder("text").fill(username);
				await page.getByPlaceholder("text").press("Tab");
				await page.getByPlaceholder("password").fill("asddasads20230720722");
				await page.getByPlaceholder("password").press("Enter");
				await page.waitForSelector(".form-message");
			});
		});
	});
});
