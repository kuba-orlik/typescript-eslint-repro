import { Context } from "koa";
import { Mountable } from "@sealcode/sealgen";
import Router from "@koa/router";

export const actionName = "Logout";

export default new (class LogoutRedirect extends Mountable {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async canAccess(_: Context) {
		return { canAccess: true, message: "" };
	}

	mount(router: Router, path: string) {
		router.get(path, async (ctx) => {
			try {
				const session_id: string = ctx.cookies.get("sealious-session") as string;
				if (session_id) {
					await ctx.$app.collections.sessions.logout(
						new ctx.$app.SuperContext(),
						session_id
					);
					ctx.status = 302;
					ctx.redirect("/");
				}
			} catch (error) {
				console.error("Error during logout:", error);
			}
		});
	}
})();
