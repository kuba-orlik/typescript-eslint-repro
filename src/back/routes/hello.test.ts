import { withProdApp } from "../test_utils/with-prod-app";
import { VERY_LONG_TEST_TIMEOUT, webhintURL } from "../test_utils/webhint";
import { HelloURL } from "./urls";

describe("Hello", () => {
	it("doesn't crash", async function () {
		this.timeout(VERY_LONG_TEST_TIMEOUT);
		return withProdApp(async ({ base_url, rest_api }) => {
			await rest_api.get(HelloURL);
			await webhintURL(base_url + HelloURL);
			// alternatively you can use webhintHTML for faster but less precise scans
			// or for scanning responses of requests that use some form of authorization:
			// const response = await rest_api.get(HelloURL);
			// await webhintHTML(response);
		});
	});
});
