import Router from "@koa/router";
import { Middlewares } from "sealious";
import { loginRouter } from "./login/index.js";
import { MainView } from "./main-view.js";
import { tasksRouter } from "./tasks/index.js";

export const mainRouter = (router: Router): void => {
	router.get("/", Middlewares.extractContext(), async (ctx) => {
		ctx.body = MainView(ctx);
	});

	loginRouter(router);
	tasksRouter(router);
};
