import { App, Collection, CollectionItem, Context, FieldTypes, Policies } from "sealious";
import PasswordResetTemplate from "../email-templates/password-reset";
import TheApp from "../app";

export default class PasswordResetIntents extends Collection {
	name = "password-reset-intents";
	fields = {
		email: new FieldTypes.ValueExistingInCollection({
			field: "email",
			collection: "users",
			include_forbidden: true,
		}),
		token: new FieldTypes.SecretToken(),
	};
	policies = {
		create: new Policies.Public(),
		edit: new Policies.Noone(),
	};
	defaultPolicy: Policies.Super;
	async init(app: App, name: string) {
		const theApp = app as TheApp;
		await super.init(app, name);
		app.collections["password-reset-intents"].on(
			"after:create",
			async ([context, intent]: [
				Context,
				CollectionItem<PasswordResetIntents>,
				any
			]) => {
				const intent_as_super = await intent.fetchAs(new app.SuperContext());
				const message = await PasswordResetTemplate(theApp, {
					email_address: intent.get("email") as string,
					token: intent_as_super.get("token") as string,
				});
				await message.send(app);
			}
		);
	}
}
