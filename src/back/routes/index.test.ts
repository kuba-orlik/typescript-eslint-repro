import { VERY_LONG_TEST_TIMEOUT, webhintURL } from "../test_utils/webhint.js";
import { withProdApp } from "../test_utils/with-prod-app.js";

describe("homepage", function () {
	this.timeout(VERY_LONG_TEST_TIMEOUT);
	it("passes webhint tests", () =>
		withProdApp(async ({ base_url }) => {
			await webhintURL(`${base_url}/`);
		}));
});
