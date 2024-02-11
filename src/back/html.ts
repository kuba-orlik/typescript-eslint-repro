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
							function make_new_link() {
								const new_link = document.createElement("link");
								new_link.rel = "stylesheet";
								new_link.href = \`/dist/main.css?\${Math.random()}+\${Math.random()}\`;
								new_link.type = "text/css";
								return new_link;
							}

							function getStyles() {
								return Array.from(
									document.querySelectorAll("head link")
								).filter(
									(e) => new URL(e.href).pathname == "/dist/main.css"
								);
							}

							function refresh_css() {
								const new_link = make_new_link();

								//only remove old css once the new one is loaded to prevent blink of unstyled content
								new_link.onload = () => {
									console.log("clearing styles");
									getStyles()
										.slice(0, -1)
										.forEach((style) => {
											console.log({ style, new_link });
											if (style !== new_link) {
												style.parentElement.removeChild(style);
											}
										});
								};

								document.querySelector("head").appendChild(new_link);
							}
							document.documentElement.addEventListener(
								"turbo:morph",
								refresh_css
							);
							const socket = new WebSocket("ws://localhost:60808");
							socket.onmessage = refresh_css;
					  </script>`
					: ""}
			</body>
		</html>`;
}
