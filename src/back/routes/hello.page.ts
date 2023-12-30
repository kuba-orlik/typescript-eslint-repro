import { Context } from "koa";
import { tempstream } from "tempstream";
import { Page } from "@sealcode/sealgen";
import html from "../html.js";

export const actionName = "Hello";

export default new (class HelloPage extends Page {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async canAccess(_: Context) {
		return { canAccess: true, message: "" };
	}

	async render(ctx: Context) {
		return html(ctx, "Hello", tempstream/* HTML */ `<div></div>`);
	}
})();
