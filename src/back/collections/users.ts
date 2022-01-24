import { App, Collections, FieldTypes } from "sealious";
import TheApp from "../app";

export class Users extends Collections.users {
	fields = {
		...App.BaseCollections.users.fields,
		email: new FieldTypes.Email().setRequired(true),
		roles: new FieldTypes.ReverseSingleReference({
			referencing_collection: "user-roles",
			referencing_field: "user",
		}),
	};

	async init(app: TheApp, name: string) {
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
				await app.collections["registration-intents"].suCreate({
					email: app.manifest.admin_email,
					role: "admin",
					token: "",
				});
			}
		});
	}

	async populate(): Promise<void> {
		if (await this.app.Metadata.get("my_collection_populated")) {
			return;
		}
		const app = this.app as TheApp;

		await app.collections.users.suCreate({
			email: "admin@example.com",
			roles: [],
			username: "admin",
			password: "password",
		});

		await this.app.Metadata.set("my_collection_populated", "true");
	}
}

export default new Users();
