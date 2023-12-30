import { closeBrowser } from "./test_utils/browser-creator.js";

afterAll(async () => {
	await closeBrowser();
});
