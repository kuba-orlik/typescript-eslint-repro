import Router from "@koa/router";
import { Middlewares } from "sealious";
import { accountsRouter } from "./account/account.routes";
import { MainView } from "./common/main-view";
import { loginRouter } from "./login/login.routes";
import { tasksRouter } from "./tasks/tasks.routes";

export const mainRouter = (router: Router): void => {
	router.get("/", Middlewares.extractContext(), async (ctx) => {
		ctx.body = MainView(ctx);
	});

	loginRouter(router);
	tasksRouter(router);
	accountsRouter(router);
};
