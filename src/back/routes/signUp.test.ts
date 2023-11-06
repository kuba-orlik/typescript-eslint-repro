import { withProdApp } from "../test_utils/with-prod-app";
import { VERY_LONG_TEST_TIMEOUT, webhintURL } from "../test_utils/webhint";
import { SignUpURL, LogoutURL, SignInURL } from "./urls";
import { Browser, BrowserContext, Page } from "@playwright/test";
import { getBrowser } from "../test_utils/browser-creator";
import ADMIN_CREDENTIALS from "../default-admin-credentials";

describe("SignUp", () => {
	let page: Page;
	let browser: Browser;
	let context: BrowserContext;
	const username = ADMIN_CREDENTIALS.username;
	const password = ADMIN_CREDENTIALS.password;
	const email = ADMIN_CREDENTIALS.email;

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
			await rest_api.get(SignUpURL);
			await webhintURL(base_url + SignUpURL);
			// alternatively you can use webhintHTML for faster but less precise scans
			// or for scanning responses of requests that use some form of authorization:
			// const response = await rest_api.get(SignUpURL);
			// await webhintHTML(response);
		});
	});

	describe("signup test", () => {
		it("username is taken", async function () {
			await withProdApp(async ({ base_url }) => {
				this.timeout(VERY_LONG_TEST_TIMEOUT);
				await page.goto(base_url);
				await page.getByRole("link", { name: "Sign up" }).click();
				await page.getByPlaceholder("text").click();
				await page.getByPlaceholder("text").fill(username);
				await page.getByPlaceholder("text").press("Tab");
				await page.getByPlaceholder("email").fill("user0192939@randomsuper.com");
				await page.getByPlaceholder("email").press("Tab");
				await page.getByPlaceholder("password").fill("user12341234");
				await page.getByRole("button", { name: "Wyślij" }).click();
				await page.waitForSelector(".input__error");
			});
		});
		it("password is too shot ", async function () {
			await withProdApp(async ({ base_url }) => {
				this.timeout(VERY_LONG_TEST_TIMEOUT);
				await page.goto(base_url);
				await page.getByRole("link", { name: "Sign up" }).click();
				await page.getByPlaceholder("text").click();
				await page.getByPlaceholder("text").fill("dasdsa");
				await page.getByPlaceholder("email").click();
				await page
					.getByPlaceholder("email")
					.fill("asasdsdadsadss123asddsa@asdasca.com");
				await page.getByPlaceholder("password").click();
				await page.getByPlaceholder("password").fill("asddsa");
				await page.getByRole("button", { name: "Wyślij" }).click();
				await page.waitForSelector(".form-message.form-message--error");
			});
		});
		it("email is taken", async function () {
			await withProdApp(async ({ base_url }) => {
				this.timeout(VERY_LONG_TEST_TIMEOUT);
				await page.goto(base_url);
				await page.getByRole("link", { name: "Sign up" }).click();
				await page.getByPlaceholder("text").click();
				await page.getByPlaceholder("text").fill("ranomusername2023072722");
				await page.getByPlaceholder("text").press("Tab");
				await page.getByPlaceholder("email").fill(email);
				await page.getByPlaceholder("email").press("Tab");
				await page.getByPlaceholder("password").fill("asdasdasdasdasd");
				await page.getByRole("button", { name: "Wyślij" }).click();
				await page.waitForSelector(".form-message.form-message--error");
			});
		});
		it("correct", async function () {
			await withProdApp(async ({ base_url }) => {
				this.timeout(VERY_LONG_TEST_TIMEOUT);
				await page.goto(base_url);
				await page.getByRole("link", { name: "Sign up" }).click();
				await page.getByPlaceholder("text").click();
				await page.getByPlaceholder("text").fill("ranomusername20230720722");
				await page.getByPlaceholder("text").press("Tab");
				await page.getByPlaceholder("email").fill("radomemail@emailrandom.com");
				await page.getByPlaceholder("email").press("Tab");
				await page.getByPlaceholder("password").fill("asdasdasdasdasd");
				await page.getByRole("button", { name: "Wyślij" }).click();
				await page.waitForSelector(".success-notify");
			});
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
				await page.goto(base_url + SignUpURL);
				await page.waitForSelector('body:has-text("no access")');
				await page.goto(base_url);
				await page.getByRole("link", { name: "Logout" }).click();
				await page.waitForSelector(`a[href="${SignInURL}"]`);
			});
		});
	});
});
