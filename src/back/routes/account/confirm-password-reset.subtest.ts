import axios from "axios";
import { withProdApp } from "../../test_utils/with-prod-app";

describe("confirm-password-reset", () => {
	it("displays an html form", async () =>
		withProdApp(async ({ base_url }) => {
			await axios.get(
				`${base_url}/confirm-password-reset?token=kupcia&email=dupcia`
			);
		}));
});
