import Router from "@koa/router";
import { Middlewares } from "sealious";
import { MainView } from "./common/main-view";
import { loginRouter } from "./login/login.routes";
import mountAutoRoutes from "./routes";

export const mainRouter = (router: Router): void => {
	router.get("/", Middlewares.extractContext(), async (ctx) => {
		ctx.body = MainView(ctx);
	});

	router.use(Middlewares.extractContext());

	loginRouter(router);
	mountAutoRoutes(router);
};
