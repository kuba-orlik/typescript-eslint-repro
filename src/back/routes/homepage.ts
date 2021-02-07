import Router from "@koa/router";
import { Context, Middlewares } from "sealious";
import html from "../html";
import { NewTask, TaskList } from "../views/tasks";

const router = new Router();

export async function MainView(context: Context) {
	return await html(
		context,
		/* HTML */ `<title>My ToDo App</title>
			<body>
				<h1>My ToDo App</h1>
				${await TaskList(context)} ${NewTask()}
			</body>`
	);
}

router.get("/", Middlewares.extractContext(), async (ctx) => {
	ctx.body = await MainView(ctx.$context);
});

export default router;
