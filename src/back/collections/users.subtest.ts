import assert from "assert";
import { withProdApp } from "../test_utils/with-prod-app";

describe("users", () => {
	it.skip("should properly handle route to account creation", async () =>
		withProdApp(async ({ app, rest_api }) => {
			const sealious_response = await app.collections["registration-intents"]
				.suList()
				.filter({ email: app.manifest.admin_email })
				.fetch();

			const { email, token } = sealious_response.items[0].serializeBody();
			const response = await rest_api.get(
				`/account-creation-details?token=${token as string}&email=${
					email as string
				}`
			);
			assert(response.includes("Please fill in the details of your account"));
		}));
});
