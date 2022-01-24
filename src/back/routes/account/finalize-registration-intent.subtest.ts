import * as assert from "assert";
import { withProdApp } from "../../test_utils/with-prod-app";

describe("finalize registration", () => {
	it("allows to register an account (entire flow)", async () =>
		withProdApp(async ({ app, mail_api, rest_api }) => {
			app.ConfigManager.set("roles", ["admin"]);
			await rest_api.post("/api/v1/collections/registration-intents", {
				email: "user@example.com",
				role: "admin",
			});
			const message_metadata = (await mail_api.getMessages()).filter(
				(message) => message.recipients[0] == "<user@example.com>"
			)[0];
			assert.ok(message_metadata?.subject);

			const message = await mail_api.getMessageById(message_metadata.id);
			const match_result = /token=([^?&]+)/.exec(message);
			if (!match_result) {
				throw new Error("Didn't find a token");
			}
			const token = match_result[1];

			await rest_api.post("/finalize-registration-intent", {
				email: "user@example.com",
				token,
				password: "password",
				username: "user",
			});

			const options = await rest_api.login({
				username: "user",
				password: "password",
			});

			const response = await rest_api.get(
				"/api/v1/collections/users/me?attachments[roles]=true",
				options
			);
			assert.equal(response.items[0].roles.length, 1);
			assert.equal(response.attachments[response.items[0].roles[0]].role, "admin");
		}));
});
