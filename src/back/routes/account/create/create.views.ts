import { BaseContext } from "koa";
import { Errors } from "sealious";
import RegistrationIntents from "../../../collections/registration-intents";
import html from "../../../html";
import { CollectionTiedFormData } from "../../common/form";
import navbar from "../../common/navbar";
import input from "../../common/ui/input";

export function createAccountForm(
	ctx: BaseContext,
	{ values, errors }: CollectionTiedFormData<RegistrationIntents> = {
		values: {},
	}
) {
	errors =
		errors ||
		new Errors.FieldsError(ctx.$app.collections["registration-intents"], {}); // empty error;
	return html(
		ctx,
		/* HTML */ `<title>Sign up</title>${navbar(ctx)}
			<h1>Register</h1>
			<form action="/account/create" method="POST">
				${input({
					name: "email",
					value: values.email,
					type: "email",
					error: errors.getErrorForField("email"),
				})}
				<input type="submit" value="register" />
			</form>`
	);
}
