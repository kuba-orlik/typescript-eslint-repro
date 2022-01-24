import { Middleware } from "@koa/router";
import { URL } from "url";
import { Errors } from "sealious";
import { hasShape, predicates } from "@sealcode/ts-predicates";

const finalizePasswordReset: Middleware = async (ctx) => {
	if (
		!hasShape(
			{
				redirect: predicates.or(predicates.string, predicates.undefined),
				token: predicates.string,
				password: predicates.string,
			},
			ctx.$body
		)
	) {
		throw new Error("Wrong parameters. Needed: token, password. Optional: redirect.");
	}

	const intent_response = await ctx.$app.collections["password-reset-intents"]
		.suList()
		.filter({ token: ctx.$body.token })
		.fetch();

	if (intent_response.empty) {
		throw new Errors.BadContext("Incorrect token");
	}

	const intent = intent_response.items[0];

	const user_response = await ctx.$app.collections.users
		.suList()
		.filter({ email: intent.get("email") as string })
		.fetch();
	if (user_response.empty) {
		throw new Error("No user with this email address.");
	}
	user_response.items[0].set("password", ctx.$body.password);
	await user_response.items[0].save(new ctx.$app.SuperContext());
	await intent.remove(new ctx.$app.SuperContext());

	if (
		ctx.$body.redirect &&
		new URL(ctx.$app.manifest.base_url).origin == new URL(ctx.$body.redirect).origin
	) {
		ctx.redirect(ctx.$body.redirect);
	} else {
		ctx.body = "Password reset successful";
	}
};

export default finalizePasswordReset;
