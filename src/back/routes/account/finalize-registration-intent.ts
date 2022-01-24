import { Middleware } from "@koa/router";
import { hasShape, predicates } from "@sealcode/ts-predicates";
import assert from "assert";

const finalizeRegistrationIntent: Middleware = async (ctx) => {
	if (
		!hasShape(
			{
				token: predicates.string,
				username: predicates.string,
				password: predicates.string,
			},
			ctx.$body
		)
	) {
		throw new Error("Missing attributes. Required: token, username, password");
	}
	const intents = await ctx.$app.collections["registration-intents"]
		.suList()
		.filter({ token: ctx.$body.token })
		.fetch();
	if (intents.empty) {
		throw new Error("Incorrect token");
	}

	const intent = intents.items[0];
	const user = await ctx.$app.collections.users.suCreate({
		password: ctx.$body.password,
		username: ctx.$body.username,
		email: intent.get("email") as string,
		roles: [],
	});
	if (intent.get("role")) {
		await ctx.$app.collections["user-roles"].suCreate({
			user: user.id,
			role: intent.get("role") as string,
		});
	}
	await intent.remove(new ctx.$app.SuperContext());
	const target_path = ctx.$app.ConfigManager.get("accout_creation_success_path");
	if (target_path) {
		assert.strictEqual(
			target_path[0],
			"/",
			"'accout_creation_success_path' set, but doesn't start with a '/'"
		);
		ctx.body = `<meta http-equiv="refresh" content="0; url=${target_path}" />`;
	}
	ctx.body = "Account creation successful";
	ctx.status = 201;
};

export default finalizeRegistrationIntent;
