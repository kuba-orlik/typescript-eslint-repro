import { FlatTemplatable, Templatable, tempstream } from "tempstream";
import { Readable } from "stream";
import { BaseContext } from "koa";
import { default as default_navbar } from "./routes/common/navbar.js";
import { toKebabCase } from "js-convert-case";
import { DEFAULT_HTML_LANG } from "./config.js";

export const defaultHead = (
	ctx: BaseContext,
	title: string,
	options: HTMLOptions
) => /* HTML */ `<title>${title} · ${ctx.$app.manifest.name}</title>
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<script async src="/dist/bundle.js"></script>
	<link
		href="/dist/main.css${options.autoRefreshCSS
			? `?${Math.random()}${Math.random()}`
			: ""}"
		rel="stylesheet"
		type="text/css"
	/>
	<link href="/dist/fonts/fonts.css" rel="stylesheet" type="text/css" />
	${options.morphing ? `<meta name="turbo-refresh-method" content="morph" />` : ""}
	${options.preserveScroll
		? `<meta name="turbo-refresh-scroll" content="preserve">`
		: ""}`;

export type HTMLOptions = {
	preserveScroll?: boolean;
	morphing?: boolean;
	navbar?: (ctx: BaseContext) => FlatTemplatable;
	autoRefreshCSS?: boolean;
	disableCopyEvent?: boolean;
	language?: string;
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
	const controllers: string[] = [];
	if (htmlOptions.autoRefreshCSS) {
		controllers.push("refresh-styles");
		controllers.push("refresh-on-ts-changes");
	}
	return tempstream/* HTML */ ` <!DOCTYPE html>
		<html
			lang="${htmlOptions.language || DEFAULT_HTML_LANG}"
			class="title--${toKebabCase(title)}"
		>
			<head>
				${makeHead(ctx, title, htmlOptions)}
			</head>
			<body data-controller="${controllers.join(" ")}">
				${(htmlOptions.navbar || default_navbar)(ctx)} ${body}
				${htmlOptions.disableCopyEvent
					? /* HTML */ "<script>document.addEventListener('copy', (e) => e.preventDefault());</script>"
					: ""}
			</body>
		</html>`;
}
