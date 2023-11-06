import { LONG_TEST_TIMEOUT } from "./src/back/test_utils/webhint";
import { closeBrowser } from "./src/back/test_utils/browser-creator";

exports.mochaHooks = {
	async afterAll() {
		this.timeout(LONG_TEST_TIMEOUT);
		await closeBrowser();
	},
};
