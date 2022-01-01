import { Templatable, tempstream } from "tempstream";
import { Readable } from "stream";
import { BaseContext } from "koa";

export default function html(ctx: BaseContext, body: Templatable): Readable {
	ctx.set("content-type", "text/html;charset=utf-8");
	return tempstream/* HTML */ ` <!DOCTYPE html>
		<html>
			<head>
				<meta name="viewport" content="width=device-width" />
				<script async src="/dist/bundle.js"></script>
				<link href="/dist/style.css" rel="stylesheet" type="text/css" />
			</head>
			${body}
		</html>`;
}
