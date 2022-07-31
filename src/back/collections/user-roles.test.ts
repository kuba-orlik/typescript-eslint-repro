import assert from "assert";
import axios from "axios";
import { Context, TestUtils } from "sealious";
import { withProdApp } from "../test_utils/with-prod-app";
import { createAdmin, createAUser } from "../test_utils/users";
import Users from "./users";

describe("user-roles", () => {
	it("rejects when given an empty role", async () =>
		withProdApp(async ({ app, rest_api }) => {
			const [user, session] = await createAdmin(app, rest_api);
			await TestUtils.assertThrowsAsync(
				async () => {
					return rest_api.post(
						`/api/v1/collections/user-roles`,
						{
							user: user.id,
						},
						session
					);
				},
				(e: any) => {
					assert.equal(
						e?.response.data.data.field_messages.role?.message,
						"Missing value for field 'role'."
					);
				}
			);
		}));

	it("accepts correct dataset", async () =>
		withProdApp(async ({ app, base_url, rest_api }) => {
			const [user, session] = await createAdmin(app, rest_api);
			const response = await axios.post(
				`${base_url}/api/v1/collections/user-roles`,
				{
					user: user.id,
					role: "admin",
				},
				session
			);
			assert.equal(response.status, 201);
		}));

	it("get user roles with admin", async () =>
		withProdApp(async ({ app, rest_api }) => {
			const [user] = await createAdmin(app, rest_api);
			const roles = await Users.getRoles(
				new Context(app, new Date().getTime(), user.id)
			);
			assert.ok(roles.includes("admin"));
		}));

	it("get user with no roles", async () =>
		withProdApp(async ({ app }) => {
			const user = await createAUser(app, "normal");
			const roles = await Users.getRoles(
				new Context(app, new Date().getTime(), user.id)
			);
			assert.ok(roles.length === 0);
		}));

	it("get no roles for no logged user", async () =>
		withProdApp(async ({ app }) => {
			const roles = await Users.getRoles(
				new Context(app, new Date().getTime(), null)
			);
			assert.ok(roles.length === 0);
		}));
});
