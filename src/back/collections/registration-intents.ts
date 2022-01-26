import { App, Collection, FieldTypes, Policies } from "sealious";
import RegistrationIntentTemplate from "../email-templates/registration-intent";

export default class RegistrationIntents extends Collection {
	fields = {
		email: new FieldTypes.ValueNotExistingInCollection({
			collection: "users",
			field: "email",
			include_forbidden: true,
		}),
		token: new FieldTypes.SecretToken(),
		role: new FieldTypes.SettableBy(
			new FieldTypes.Enum((app: App) => app.ConfigManager.get("roles")),
			new Policies.UsersWhoCan(["create", "user-roles"])
		),
	};

	policies = {
		create: new Policies.Public(),
		edit: new Policies.Noone(),
	};

	defaultPolicy = new Policies.Super();

	async init(app: App, name: string) {
		await super.init(app, name);
		this.on("after:create", async ([context, intent]) => {
			await intent.decode(context);
			const {
				items: [item],
			} = await app.collections["registration-intents"]
				.suList()
				.ids([intent.id])
				.fetch();
			const token = item.get("token") as string;
			const message = await RegistrationIntentTemplate(app, {
				email_address: intent.get("email") as string,
				token,
			});
			await message.send(app);
		});
	}
}
