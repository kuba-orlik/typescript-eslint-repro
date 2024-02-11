import Router from "@koa/router";
import { Middlewares } from "sealious";
import { MainView } from "./common/main-view.js";
import mountAutoRoutes from "./routes.js";

export const mainRouter = (router: Router): void => {
	const started_at = Date.now(); // necessary to detect aplication restarts

	router.get("/", Middlewares.extractContext(), async (ctx) => {
		ctx.body = MainView(ctx);
	});

	router.use(Middlewares.extractContext());
	router.get("/status.json", Middlewares.extractContext(), async (ctx) => {
		ctx.body = { status: ctx.$app.status, started_at };
	});

	mountAutoRoutes(router);
};
