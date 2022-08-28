// DO NOT EDIT! This file is generated automaticaly with npm run generate-routes

import Koa, { Context } from "koa";
import Router from "@koa/router";
import { Middlewares } from "sealious";
import { Mountable } from "@sealcode/sealgen";
import * as URLs from "./urls";

import { default as Hello } from "./hello.page";

async function handleHtmlPromise(ctx: Context, next: Koa.Next) {
	await next();
	if (ctx.body instanceof Promise) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		ctx.body = await ctx.body;
	}
	ctx.set("content-type", "text/html;charset=utf-8");
}

function mount(router: Router, URL: string, mountable: Mountable) {
	router.use(
		URL,
		Middlewares.extractContext(),
		Middlewares.parseBody(),
		handleHtmlPromise
	);
	mountable.init();
	mountable.mount(router, URL);
	// to automatically add trailing slashes:
	router.get(URL.slice(0, -1), (ctx) => ctx.redirect(URL));
	router.use(URL, (ctx) => ctx.set("content-type", "text/html;charset=utf-8"));
}

export default function mountAutoRoutes(router: Router) {
	mount(router, URLs.HelloURL, Hello);
}
