import html from "../../html";
import { BaseContext } from "koa";
import { Readable } from "stream";
import { tempstream } from "tempstream";
import navbar from "./navbar";
import { NewTask, TaskList } from "../tasks/tasks.views";

export function MainView(ctx: BaseContext): Readable {
	return html(
		ctx,
		tempstream/* HTML */ ` <title>My Own ToDo App</title>
			<body>
				${navbar(ctx)}
				<h1>My ToDo App (with esbuild!)</h1>

				${TaskList(ctx.$context)} ${NewTask()}
			</body>`
	);
}
