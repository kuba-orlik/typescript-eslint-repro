import { BaseContext } from "koa";
import html from "../../../html";
import navbar from "../../common/navbar";
import input from "../../common/ui/input";

export async function accountCreationDetailsForm(
	ctx: BaseContext,
	{
		values,
		errors,
	}: {
		values: { token: string; email: string; username?: string };
		errors?: { email?: string; username?: string; password?: string };
	}
) {
	errors = errors || {};
	return html(
		ctx,
		/* HTML */ `
			${navbar(ctx)}
			<h1>${ctx.$app.i18n("registration_intent_cta")}</h1>
			<form method="POST" id="form" action="/account/confirm-registration-email">
				<input type="hidden" name="token" value="${values.token || ""}" />
				<fieldset>
					<legend>
						${ctx.$app.i18n("registration_intent_form_description")}
					</legend>
					${input({
						name: "email",
						type: "email",
						value: values.email || "",
						readonly: true,
						error: "",
					})}
					${input({
						name: "username",
						value: values.username,
						error: errors.username || "",
						type: "text",
					})}
					${input({
						name: "password",
						value: "",
						error: errors.password || "",
						type: "password",
					})}
					<input
						type="submit"
						value="${ctx.$app.i18n("registration_intent_cta")}"
					/>
				</fieldset>
			</form>
		`
	);
}
