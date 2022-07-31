import { App, Collections, Context, FieldTypes, Policies } from "sealious";
import assert from "assert";
import TheApp from "../app";

export default class Users extends Collections.users {
	fields = {
		...App.BaseCollections.users.fields,
		email: new FieldTypes.Email().setRequired(true),
		roles: new FieldTypes.ReverseSingleReference({
			referencing_collection: "user-roles",
			referencing_field: "user",
		}),
	};

	defaultPolicy = new Policies.Themselves();

	async init(app: App, name: string) {
		assert(app instanceof TheApp);
		await super.init(app, name);
		app.on("started", async () => {
			const users = await app.collections.users
				.suList()
				.filter({ email: app.manifest.admin_email })
				.fetch();
			if (users.empty) {
				app.Logger.warn(
					"ADMIN",
					`Creating an admin account for ${app.manifest.admin_email}`
				);
				await app.collections.users.suCreate({
					username: "admin",
					password: "adminadmin",
					email: "admin@example.com",
					roles: [],
				});
			}
		});
	}

	public static async getRoles(ctx: Context) {
		const rolesEntries = await ctx.app.collections["user-roles"]
			.list(ctx)
			.filter({ user: ctx.user_id || "" })
			.fetch();

		return rolesEntries.items.map((item) => item.get("role"));
	}
}
