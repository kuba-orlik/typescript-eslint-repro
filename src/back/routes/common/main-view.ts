import html from "../../html.js";
import { BaseContext } from "koa";
import { Readable } from "stream";
import { tempstream } from "tempstream";

export function MainView(ctx: BaseContext): Readable {
	return html(
		ctx,
		"",
		tempstream/* HTML */ `
			<title>My Own ToDo App</title>

			<h1>Sealious App</h1>
		`
	);
}
