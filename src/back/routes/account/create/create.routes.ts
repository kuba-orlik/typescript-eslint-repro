import Router from "@koa/router";
import { Errors, Middlewares } from "sealious";
import html from "../../../html";
import { formHasSomeFields } from "../../common/form";
import { createAccountForm } from "./create.views";

export default function createRouter(router: Router) {
	router.use("/account/create", Middlewares.extractContext());

	router.get("/account/create", (ctx) => {
		console.log({ ctx });
		ctx.body = createAccountForm(ctx);
	});

	router.get(
		"/account/create/email-sent",
		(ctx) => (ctx.body = html(ctx, `Registration email sent`))
	);

	router.post("/account/create", Middlewares.parseBody(), async (ctx) => {
		const registrationIntents = ctx.$app.collections["registration-intents"];
		// the line below enables typescript to deduce the type of ctx.$body and
		// avoid type assertions
		if (!formHasSomeFields(ctx, <const>["email"], ctx.$body)) return;
		try {
			await registrationIntents.create(ctx.$context, ctx.$body);
			ctx.status = 303;
			ctx.redirect("/account/create/email-sent");
		} catch (e) {
			if (Errors.FieldsError.isFieldsError(registrationIntents, e)) {
				ctx.status = 422;
				ctx.body = createAccountForm(ctx, {
					values: { email: ctx.$body.email },
					errors: e,
				});
			} else {
				ctx.body = "error";
			}
		}
	});
}
