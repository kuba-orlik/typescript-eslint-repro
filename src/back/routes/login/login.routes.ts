import Router from "@koa/router";
import { Middlewares } from "sealious";
import html from "../../html";

export const loginRouter = (router: Router): void => {
	router.get("/login", Middlewares.extractContext(), async (ctx) => {
		ctx.body = html(ctx, LoginForm());
	});

	router.post(
		"/login",
		Middlewares.extractContext(),
		Middlewares.parseBody(),
		async (ctx) => {
			try {
				const session_id = await ctx.$app.collections.sessions.login(
					ctx.$body.username as string,
					ctx.$body.password as string
				);
				ctx.cookies.set("sealious-session", session_id, {
					maxAge: 1000 * 60 * 60 * 24 * 7,
					secure: ctx.request.protocol === "https",
					overwrite: true,
				});
				ctx.redirect("/user");
			} catch (e) {
				ctx.status = 422;
				ctx.body = html(
					ctx,
					LoginForm(ctx.$body.username as string, (e as Error).message)
				);
			}
		}
	);
};

function LoginForm(username = "", error_message?: string): string {
	if (error_message) {
		error_message =
			error_message == "Incorrect username!"
				? "Niepoprawna nazwa użytkownika!"
				: "Niepoprawne hasło!";
	}
	return /* HTML */ `
		<turbo-frame id="login">
			<h2>Zaloguj</h2>
			<form method="POST" action="/login" data-turbo-frame="_top">
				${error_message ? `<div>${error_message}</div>` : ""}
				<label for="username">
					Nazwa użytkownika:
					<input
						id="username"
						name="username"
						type="text"
						value="${username}"
						required
					/>
				</label>
				<label for="password"
					>Hasło:
					<input
						id="password"
						name="password"
						type="password"
						value=""
						required
				/></label>
				<input type="submit" value="Zaloguj" />
			</form>
		</turbo-frame>
	`;
}
