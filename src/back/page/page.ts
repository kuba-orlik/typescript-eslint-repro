import Router from "@koa/router";
import { BaseContext } from "koa";

import { Templatable, tempstream } from "tempstream";

export type PageErrorMessage = { type: "access" | "internal"; message: string };

export interface Mountable {
	mount: (router: Router, path: string) => void;
	canAccess: (ctx: BaseContext) => Promise<{ canAccess: boolean; message: string }>;
	renderError(ctx: BaseContext, error: PageErrorMessage): Promise<Templatable>;
}

export abstract class Page implements Mountable {
	mount(router: Router, path: string) {
		router.get(path, async (ctx) => {
			ctx.body = await this.render(ctx);
		});
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async canAccess(_: BaseContext) {
		return { canAccess: true, message: "" };
	}

	async renderError(_: BaseContext, error: PageErrorMessage) {
		return tempstream/* HTML */ `<div>${error.message}</div>`;
	}

	public abstract render(ctx: BaseContext): Promise<Templatable>;
}
