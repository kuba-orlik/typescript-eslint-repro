import { webhintURL } from "../test_utils/webhint";
import { withProdApp } from "../test_utils/with-prod-app";

describe("homepage", function () {
	this.timeout(200000);
	it("passes webhint tests", () =>
		withProdApp(async ({ base_url }) => {
			await webhintURL(`${base_url}/`);
		}));
});
