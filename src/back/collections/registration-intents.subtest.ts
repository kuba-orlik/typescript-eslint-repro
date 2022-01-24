import axios from "axios";
import assert from "assert";
import { TestUtils, Policies } from "sealious";
import { withProdApp } from "../test_utils/with-prod-app";

describe("registration-intents", () => {
	it("doesn't allow setting a role for registration intention when the user in context can't create user-roles", async () =>
		withProdApp(async ({ app, base_url }) => {
			app.collections["user-roles"].setPolicy("create", new Policies.Noone());
			await TestUtils.assertThrowsAsync(
				() =>
					axios.post(`${base_url}/api/v1/collections/registration-intents`, {
						email: "cunning@fox.com",
						role: "admin",
					}),
				(e: any) => {
					assert.equal(
						e.response.data.data.field_messages.role.message,
						app.i18n("policy_users_who_can_deny", [
							"create",
							"user-roles",
							app.i18n("policy_noone_deny"),
						])
					);
				}
			);
		}));

	it("allows setting a role for registration intention when the user in context can create user-roles", async () =>
		withProdApp(async ({ app, base_url }) => {
			app.collections["user-roles"].setPolicy("create", new Policies.Public());
			const intent = (
				await axios.post(`${base_url}/api/v1/collections/registration-intents`, {
					email: "genuine@fox.com",
					role: "admin",
				})
			).data;
			assert.equal(intent.role, "admin");

			const role = (
				await app.collections["registration-intents"].suGetByID(
					intent.id as string
				)
			).get("role");

			assert.equal(role, "admin");
		}));
});
