import { BaseContext } from "koa";
import { tempstream } from "tempstream";
import html from "../../html";
import { Page } from "../../page/page";

export const actionName = "MyProfile";

export default new (class MyProfilePage extends Page {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async canAccess(_: BaseContext) {
		return { canAccess: true, message: "" };
	}

	async render(ctx: BaseContext) {
		const user = await ctx.$context.getUserData(ctx.$app);
		if (!user) {
			return "User not found";
		}
		return html(
			ctx,
			"Mój profil",
			tempstream`<div>Welcome, ${user.get("username")}!</div>`
		);
	}
})();
