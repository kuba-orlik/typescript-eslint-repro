import { Collection, FieldTypes, Policies } from "sealious";
import { Roles } from "../policy-types/roles.js";

export default class Groups extends Collection {
	fields = {
		name: new FieldTypes.Text(),
	};
	defaultPolicy = new Policies.LoggedIn();
	policies = {
		create: new Roles(["admin"]),
		edit: new Roles(["admin"]),
	};

	async populate(): Promise<void> {
		if (await this.app.Metadata.get("groups_populated")) {
			return;
		}
		// eslint-disable-next-line no-console
		console.log("### Populating groups");
		// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
		await this.app.Metadata.set("groups_populated", "true");
	}
}
