import assert from "assert";
import { AxiosError } from "axios";
import { TestUtils } from "sealious";
import TheApp from "../../app";
import { withProdApp } from "../../test_utils/with-prod-app";

describe.only("finalize password reset", () => {
	async function createAUser(app: TheApp) {
		await app.collections.users.suCreate({
			username: "user",
			email: "user@example.com",
			password: "password",
			roles: [],
		});
	}

	it("allows to change a password (entire flow)", async () =>
		withProdApp(async ({ app, mail_api, rest_api }) => {
			await createAUser(app);

			const options = await rest_api.login({
				username: "user",
				password: "password",
			});
			await rest_api.delete("/api/v1/collections/sessions/current", options);
			await rest_api.post("/api/v1/collections/password-reset-intents", {
				email: "user@example.com",
			});

			const message_metadata = (await mail_api.getMessages()).filter(
				(message) => message.recipients[0] == "<user@example.com>"
			)[0];
			assert(message_metadata.subject);

			const message = await mail_api.getMessageById(message_metadata.id);

			const matches = /token=([^?&]+)/.exec(message);
			if (!matches) {
				throw new Error("token not found in the message");
			}
			const token = matches[1];
			await rest_api.post("/finalize-password-reset", {
				email: "user@example.com",
				token,
				password: "new-password",
			});
			await rest_api.post(
				"/api/v1/sessions",
				{ username: "user", password: "new-password" },
				options
			);

			await TestUtils.assertThrowsAsync(
				async () =>
					rest_api.post("/finalize-password-reset", {
						email: "user@example.com",
						token,
						password: "using the same token twice hehehehhee",
					}),
				(e: AxiosError) => {
					assert.strictEqual(e?.response?.data?.message, "Incorrect token");
				}
			);
		}));
});
