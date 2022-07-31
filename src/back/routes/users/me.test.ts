import { withProdApp } from "../../test_utils/with-prod-app";
import { LONG_TEST_TIMEOUT, webhintURL } from "../../test_utils/webhint";
import { MyProfileURL } from "../routes";

describe("MyProfile", () => {
	it("doesn't crash", async function () {
		this.timeout(LONG_TEST_TIMEOUT);
		return withProdApp(async ({ base_url, rest_api }) => {
			await rest_api.get(MyProfileURL);
			await webhintURL(base_url + MyProfileURL);
			// alternatively you can use webhintHTML for faster but less precise scans
			// or for scanning responses of requests that use some form of authorization:
			// const response = await rest_api.get(MyProfileURL);
			// await webhintHTML(response);
		});
	});
});
