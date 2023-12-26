import Router from "@koa/router";
import { Middlewares } from "sealious";
import { MainView } from "./common/main-view.js";
import mountAutoRoutes from "./routes.js";

export const mainRouter = (router: Router): void => {
	router.get("/", Middlewares.extractContext(), async (ctx) => {
		ctx.body = MainView(ctx);
	});

	router.use(Middlewares.extractContext());

	mountAutoRoutes(router);
};
