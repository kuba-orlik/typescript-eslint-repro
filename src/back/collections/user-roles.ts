import { App, Collection, FieldTypes, Policies, Policy } from "sealious";
import { Roles } from "../policy-types/roles";

export default class UserRoles extends Collection {
	name = "user-roles";
	fields = {
		role: new FieldTypes.Enum((app: App) =>
			app.ConfigManager.get("roles")
		).setRequired(true),
		user: new FieldTypes.SingleReference("users"),
	};

	// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
	policies = {
		create: new Roles(["admin"]),
		delete: new Policies.Public(),
		show: new Policies.UserReferencedInField("user"),
		edit: new Policies.Noone(),
	} as { [policy: string]: Policy }; // this `as` statement allows the policies to be overwritten;

	async init(app: App, collection_name: string) {
		await super.init(app, collection_name);
		app.on("started", async () => {
			const roles = app.collections["user-roles"];
			for (const action of <const>["create", "delete"]) {
				const policy = roles.getPolicy(action);
				if (policy instanceof Policies.Public) {
					app.Logger.warn(
						"USER POLICY",
						`<user-roles> collection is using <public> access strategy for ${action} action. Anyone can change anyone elses role. This is the default behavior and you should overwrite it with <set_policy>`
					);
				}
			}
		});
	}
}
