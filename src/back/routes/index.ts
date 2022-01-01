import { Middlewares } from "sealious";
import html from "../html";
import { NewTask, TaskList } from "../views/tasks";
import { BaseContext } from "koa";
import { Readable } from "stream";
import { tempstream } from "tempstream";
import { router } from "..";

export function MainView(ctx: BaseContext): Readable {
	return html(
		ctx,
		/* HTML */ tempstream` <title>My ToDo App</title>
			<body>
				<h1>My ToDo App</h1>
				${TaskList(ctx.$context)} ${NewTask()}
			</body>`
	);
}

router.get("/", Middlewares.extractContext(), async (ctx) => {
	ctx.body = MainView(ctx);
});

require("./login/index");
require("./tasks/index");
