import { Templatable, tempstream } from "tempstream";
import { Readable } from "stream";
import { BaseContext } from "koa";
import navbar from "./routes/common/navbar";

export const defaultHead = (ctx: BaseContext, title: string) => /* HTML */ `<title>
		${title} · ${ctx.$app.manifest.name}
	</title>
	<meta name="viewport" content="width=device-width" />
	<script async src="/dist/bundle.js"></script>
	<link href="/dist/style.css" rel="stylesheet" type="text/css" />`;

export default function html(
	ctx: BaseContext,
	title: string,
	body: Templatable,
	makeHead: (ctx: BaseContext, title: string) => Templatable = defaultHead
): Readable {
	ctx.set("content-type", "text/html;charset=utf-8");
	return tempstream/* HTML */ ` <!DOCTYPE html>
		<html lang="pl">
			<head>
				${makeHead(ctx, title)}
			</head>
			<body>
				${navbar(ctx)} ${body}
			</body>
		</html>`;
}
