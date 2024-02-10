import { FlatTemplatable, Templatable, tempstream } from "tempstream";
import { Readable } from "stream";
import { BaseContext } from "koa";
import { default as default_navbar } from "./routes/common/navbar.js";
import { toKebabCase } from "js-convert-case";

export const defaultHead = (ctx: BaseContext, title: string) => /* HTML */ `<title>
		${title} · ${ctx.$app.manifest.name}
	</title>
	<meta name="viewport" content="width=device-width" />
	<script async src="/dist/bundle.js"></script>
	<link href="/dist/main.css" rel="stylesheet" type="text/css" />`;

export type HTMLOptions = {
	preserveScroll?: boolean;
	morphing?: boolean;
	navbar?: (ctx: BaseContext) => FlatTemplatable;
	autoRefreshCSS?: boolean;
};

export default function html(
	ctx: BaseContext,
	title: string,
	body: Templatable,
	{ preserveScroll, morphing, navbar, autoRefreshCSS }: HTMLOptions = {},
	makeHead: (ctx: BaseContext, title: string) => Templatable = defaultHead
): Readable {
	ctx.set("content-type", "text/html;charset=utf-8");
	return tempstream/* HTML */ ` <!DOCTYPE html>
		<html lang="pl" class="title--${toKebabCase(title)}">
			<head>
				${makeHead(ctx, title)}
				${morphing ? `<meta name="turbo-refresh-method" content="morph" />` : ""}
				${preserveScroll
					? `<meta name="turbo-refresh-scroll" content="preserve">`
					: ""}
			</head>
			<body>
				${(navbar || default_navbar)(ctx)} ${body}
				${autoRefreshCSS
					? /* HTML */ `<script>
							function refresh_css() {
								Array.from(document.querySelectorAll("link"))
									.filter(
										(e) =>
											new URL(e.href).pathname == "/dist/main.css"
									)
									.forEach((e) => {
										const url = new URL(e.href);
										url.search =
											"?" + Math.random() + "" + Math.random();
										e.href = url.toString();
									});
							}
							const socket = new WebSocket("ws://localhost:60808");
							socket.onmessage = refresh_css;
					  </script>`
					: ""}
			</body>
		</html>`;
}
