import { VERY_LONG_TEST_TIMEOUT, webhintURL } from "../test_utils/webhint.js";
import { withProdApp } from "../test_utils/with-prod-app.js";
import { HelloURL } from "./urls.js";

describe("Hello", () => {
	it(
		"doesn't crash",
		async function () {
			return withProdApp(async ({ base_url, rest_api }) => {
				await rest_api.get(HelloURL);
				await webhintURL(base_url + HelloURL);
				// alternatively you can use webhintHTML for faster but less precise scans
				// or for scanning responses of requests that use some form of authorization:
				// const response = await rest_api.get(HelloURL);
				// await webhintHTML(response);
			});
		},
		VERY_LONG_TEST_TIMEOUT
	);
});
