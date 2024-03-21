import ADMIN_CREDENTIALS from "../default-admin-credentials.js";
import { getPage } from "../test_utils/browser-creator.js";
import { VERY_LONG_TEST_TIMEOUT, webhintURL } from "../test_utils/webhint.js";
import { withProdApp } from "../test_utils/with-prod-app.js";
import { LogoutURL, SignInURL } from "./urls.js";

describe("SignIn", () => {
	const username = ADMIN_CREDENTIALS.username;
	const password = ADMIN_CREDENTIALS.password;

	it(
		"doesn't crash",
		async function () {
			return withProdApp(async ({ base_url, rest_api }) => {
				await rest_api.get(SignInURL);
				await webhintURL(base_url + SignInURL);
				// alternatively you can use webhintHTML for faster but less precise scans
				// or for scanning responses of requests that use some form of authorization:
				// const response = await rest_api.get(SignInURL);
				// await webhintHTML(response);
			});
		},
		VERY_LONG_TEST_TIMEOUT
	);

	describe("can access test", () => {
		it(
			"access url",
			async function () {
				await withProdApp(async ({ base_url }) => {
					const { context, page } = await getPage();
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
					await context.close();
				});
			},
			VERY_LONG_TEST_TIMEOUT
		);
	});

	describe("sign in test", () => {
		it(
			"wrong username",
			async function () {
				await withProdApp(async ({ base_url }) => {
					const { context, page } = await getPage();
					await page.goto(base_url);
					await page.getByRole("link", { name: "Sign in" }).click();
					await page.getByPlaceholder("text").click();
					await page.getByPlaceholder("text").fill("username20230720722");
					await page.getByPlaceholder("text").press("Tab");
					await page.getByPlaceholder("password").fill("test");
					await page.getByPlaceholder("password").press("Enter");
					await page.waitForSelector(".form-message");
					await context.close();
				});
			},
			VERY_LONG_TEST_TIMEOUT
		);

		it(
			"correct username and password",
			async function () {
				await withProdApp(async ({ base_url }) => {
					const { context, page } = await getPage();
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
					await context.close();
				});
			},
			VERY_LONG_TEST_TIMEOUT
		);

		it(
			"wrong password",
			async function () {
				await withProdApp(async ({ base_url }) => {
					const { context, page } = await getPage();
					await page.goto(base_url);
					await page.getByRole("link", { name: "Sign in" }).click();
					await page.getByPlaceholder("text").click();
					await page.getByPlaceholder("text").fill(username);
					await page.getByPlaceholder("text").press("Tab");
					await page.getByPlaceholder("password").fill("asddasads20230720722");
					await page.getByPlaceholder("password").press("Enter");
					await page.waitForSelector(".form-message");
					await context.close();
				});
			},
			VERY_LONG_TEST_TIMEOUT
		);
	});
});
