import Router from "@koa/router";
import { hasFieldOfType, hasShape, predicates } from "@sealcode/ts-predicates";
import { Middlewares } from "sealious";
import html from "../../html";
import { LoginForm } from "./login.views";
import { formHasSomeFields } from "../common/form";
import { MyProfileURL } from "../routes";

export const loginRouter = (router: Router): void => {
	router.get("/logowanie", Middlewares.extractContext(), async (ctx) => {
		ctx.body = html(ctx, "Logowanie", LoginForm());
	});

	router.post(
		"/login",
		Middlewares.extractContext(),
		Middlewares.parseBody(),
		async (ctx) => {
			if (!formHasSomeFields(ctx, <const>["username", "password"], ctx.$body))
				return;
			if (
				!hasShape(
					{ username: predicates.string, password: predicates.string },
					ctx.$body
				)
			) {
				ctx.body = "brakuje hasła lub loginu";
				return;
			}
			try {
				const session_id = await ctx.$app.collections.sessions.login(
					ctx.$body.username,
					ctx.$body.password
				);
				ctx.cookies.set("sealious-session", session_id, {
					maxAge: 1000 * 60 * 60 * 24 * 7,
					secure: ctx.request.protocol === "https",
					overwrite: true,
				});
				ctx.redirect(MyProfileURL);
			} catch (e) {
				ctx.status = 422;
				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
				if (!hasFieldOfType(e, "message", predicates.string)) {
					console.error(e);
					return;
				}
				ctx.body = html(
					ctx,
					"Logowanie",
					LoginForm(ctx.$body.username, e.message)
				);
			}
		}
	);
};
