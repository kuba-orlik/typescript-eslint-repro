import assert from "assert";
import { TestUtils } from "sealious";
import { withProdApp } from "../test_utils/with-prod-app";

const ALLOWED_ROLES = ["admin"];

describe("roles", () => {
	it("allows access to users with designated role and denies access to users without it", async () =>
		withProdApp(async ({ app, rest_api }) => {
			await app.collections.users.suCreate({
				username: "regular-user",
				password: "password",
				email: "regular@example.com",
				roles: [],
			});

			const admin = await app.collections.users.suCreate({
				username: "admin",
				password: "admin-password",
				email: "admin@example.com",
				roles: [],
			});

			await app.collections["user-roles"].suCreate({
				user: admin.id,
				role: "admin",
			});

			await app.collections.secrets.suCreate({
				content: "It's a secret to everybody",
			});

			const admin_session = await rest_api.login({
				username: "admin",
				password: "admin-password",
			});

			const { items: admin_response } = await rest_api.get(
				"/api/v1/collections/secrets",
				admin_session
			);
			assert.equal(admin_response.length, 1);

			const user_session = await rest_api.login({
				username: "regular-user",
				password: "password",
			});
			await TestUtils.assertThrowsAsync(
				() => rest_api.get("/api/v1/collections/secrets", user_session),
				(error) => {
					assert.equal(
						error.response.data.message,
						app.i18n("policy_roles_deny", [ALLOWED_ROLES.join(", ")])
					);
				}
			);
		}));
});
