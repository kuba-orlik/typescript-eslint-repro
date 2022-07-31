import { withProdApp } from "../test_utils/with-prod-app";

describe("roles", () => {
	it("allows access to users with designated role and denies access to users without it", async () =>
		withProdApp(async ({ app }) => {
			await app.collections.users.suCreate({
				username: "regular-user",
				password: "password",
				email: "regular@example.com",
				roles: [],
			});

			const admin = await app.collections.users.suCreate({
				username: "someadmin",
				password: "admin-password",
				email: "admin@example.com",
				roles: [],
			});
			await app.collections["user-roles"].suCreate({
				user: admin.id,
				role: "admin",
			});
		}));
});
