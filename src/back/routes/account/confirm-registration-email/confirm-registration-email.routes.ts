import Router from "@koa/router";
import { Errors, Middlewares } from "sealious";
import { formHasAllFields, formHasSomeFields } from "../../common/form";
import { accountCreationDetailsForm } from "./confirm-registration-email.views";

export const confirmRegistrationRouter = (router: Router): void => {
	router.get(
		"/account/confirm-registration-email",
		Middlewares.extractContext(),
		async (ctx) => {
			if (!formHasAllFields(ctx, <const>["email", "token"], ctx.query)) return;
			ctx.body = await accountCreationDetailsForm(ctx, { values: ctx.query });
		}
	);

	router.post(
		"/account/confirm-registration-email",
		Middlewares.extractContext(),
		Middlewares.parseBody(),
		async (ctx) => {
			if (
				!formHasSomeFields(ctx, <const>["username", "password"], ctx.$body) ||
				!formHasAllFields(ctx, <const>["token", "email"], ctx.$body)
			)
				return;
			try {
				const { items: matching_intents } = await ctx.$app.collections[
					"registration-intents"
				]
					.suList()
					.filter({ token: ctx.$body.token })
					.fetch();
				if (matching_intents.length !== 1) {
					ctx.status = 403;
					return;
				}
				await ctx.$app.collections.users.suCreateUnsafe({
					username: ctx.$body.username,
					email: matching_intents[0].get("email"),

					password: ctx.$body.password,
				});
				await (
					await ctx.$app.collections["registration-intents"].getByID(
						new ctx.$app.SuperContext(),
						matching_intents[0].id
					)
				).delete(new ctx.$app.SuperContext());
				ctx.status = 303;
				ctx.redirect("account-created");
			} catch (e) {
				console.log("error", e);
				if (Errors.FieldsError.isFieldsError(ctx.$app.collections.users, e)) {
					ctx.status = 422;
					ctx.body = await accountCreationDetailsForm(ctx, {
						values: {
							username: ctx.$body.username,
							email: ctx.$body.email,
							token: ctx.$body.token,
						},
						errors: e.getSimpleMessages(),
					});
					return;
				}
			}
		}
	);
};
