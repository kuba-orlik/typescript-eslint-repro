import Router from "@koa/router";
import { Context, Middlewares } from "sealious";
import html from "../html";
import { NewTask, TaskList } from "../views/tasks";
import { BaseContext } from "koa";
import { Readable } from "stream";

const router = new Router();

export async function MainView(ctx: BaseContext): Promise<Readable> {
	return html(
		ctx,
		/* HTML */ ` <title>My ToDo App</title>
			<body>
				<h1>My ToDo App</h1>
				${await TaskList(ctx.$context)} ${NewTask()}
			</body>`
	);
}

router.get("/", Middlewares.extractContext(), async (ctx) => {
	ctx.body = MainView(ctx);
});

export default router;
