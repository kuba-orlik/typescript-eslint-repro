import { VERY_LONG_TEST_TIMEOUT, webhintURL } from "../test_utils/webhint.js";
import { withProdApp } from "../test_utils/with-prod-app.js";

describe("homepage", function () {
	it(
		"passes webhint tests",
		() =>
			withProdApp(async ({ base_url }) => {
				await webhintURL(`${base_url}/`);
			}),
		VERY_LONG_TEST_TIMEOUT
	);
});
