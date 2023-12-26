import { App, Collection, CollectionItem, Context, FieldTypes, Policies } from "sealious";
import assert from "assert";
import PasswordResetTemplate from "../email-templates/password-reset.js";
import TheApp from "../app.js";
import { assertType, predicates } from "@sealcode/ts-predicates";

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
	defaultPolicy = new Policies.Super();
	async init(app: App, name: string) {
		assert(app instanceof TheApp);
		await super.init(app, name);
		app.collections["password-reset-intents"].on(
			"after:create",
			async ([, intent]: [
				Context,
				CollectionItem<PasswordResetIntents>,
				unknown
			]) => {
				const intent_as_super = await intent.fetchAs(new app.SuperContext());
				const message = await PasswordResetTemplate(app, {
					email_address: assertType(
						intent.get("email"),
						predicates.string,
						"email_address isn't a string"
					),
					token: assertType(
						intent_as_super.get("token"),
						predicates.string,
						"token isn't a string"
					),
				});
				await message.send(app);
			}
		);
	}
}
