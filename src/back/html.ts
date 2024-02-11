import { FlatTemplatable, Templatable, tempstream } from "tempstream";
import { Readable } from "stream";
import { BaseContext } from "koa";
import { default as default_navbar } from "./routes/common/navbar.js";
import { toKebabCase } from "js-convert-case";

export const defaultHead = (
	ctx: BaseContext,
	title: string,
	options: HTMLOptions
) => /* HTML */ `<title>${title} · ${ctx.$app.manifest.name}</title>
	<meta name="viewport" content="width=device-width" />
	<script async src="/dist/bundle.js"></script>
	<link
		href="/dist/main.css${options.autoRefreshCSS
			? `?${Math.random()}${Math.random()}`
			: ""}"
		rel="stylesheet"
		type="text/css"
	/>
	${options.morphing ? `<meta name="turbo-refresh-method" content="morph" />` : ""}
	${options.preserveScroll
		? `<meta name="turbo-refresh-scroll" content="preserve">`
		: ""}`;

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
	htmlOptions: HTMLOptions = {},
	makeHead: (
		ctx: BaseContext,
		title: string,
		options: HTMLOptions
	) => Templatable = defaultHead
): Readable {
	ctx.set("content-type", "text/html;charset=utf-8");
	return tempstream/* HTML */ ` <!DOCTYPE html>
		<html lang="pl" class="title--${toKebabCase(title)}">
			<head>
				${makeHead(ctx, title, htmlOptions)}
			</head>
			<body>
				${(htmlOptions.navbar || default_navbar)(ctx)} ${body}
				${htmlOptions.autoRefreshCSS
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

							function cleanup_css() {
								console.log("clearing styles");
								getStyles()
									.slice(0, -1)
									.forEach((style) => {
										style.parentElement.removeChild(style);
									});
							}
							document.documentElement.addEventListener(
								"turbo:morph",
								cleanup_css
							);
							const socket = new WebSocket("ws://localhost:60808");
							socket.onmessage = () => {
								const new_link = make_new_link();
								new_link.onload = cleanup_css;
								document.querySelector("head").appendChild(new_link);
							};
					  </script>`
					: ""}
			</body>
		</html>`;
}
