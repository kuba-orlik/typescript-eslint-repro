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

							const sleep = (time) =>
								new Promise((resolve) => {
									setTimeout(resolve, time);
								});

							const APP_DOWN_ERROR_MESSAGE = "App is currently down";

							function get_status() {
								return fetch("/status.json").then((r) => r.json());
							}

							async function wait_for_run_id_to_change() {
								let first_timestamp;
								try {
									const { started_at, status } = await get_status();
									first_timestamp = started_at;
								} catch (e) {
									await wait_for_app_to_be_stable();
									return;
								}

								if (!first_timestamp) {
									throw new Error(APP_DOWN_ERROR_MESSAGE);
								}

								while (true) {
									const { started_at, status } =
										await get_status().catch(() => ({
											started_at: first_timestamp,
										}));
									if (started_at !== first_timestamp) {
										return;
									}
									await sleep(100);
								}
							}

							async function wait_for_app_to_be_stable(n = 3) {
								console.log("Waiting for app to be stable....");
								let counter = 0;
								while (true) {
									const { status } = await get_status().catch((e) => ({
										status: "down",
									}));
									if (status == "running") {
										console.log(counter);
										counter++;
									} else {
										counter = 0;
									}
									if (counter == n) {
										return;
									}
									await sleep(100);
								}
							}

							async function wait_for_app_restart() {
								try {
									await wait_for_run_id_to_change();
								} catch (e) {
									if (e.message !== APP_DOWN_ERROR_MESSAGE) {
										throw e;
									}
								}
								await wait_for_app_to_be_stable();
							}

							(async function () {
								const { started_at, status } = await fetch(
									"/status.json"
								).then((r) => r.json());
								last_known_start_timestamp = started_at;
								const { port, watch } = await fetch(
									"/dist/notifier.json"
								).then((r) => r.json());
								if (!watch) {
									console.warning(
										"Not running auto refresh on watch because the build process is not running in watch mode"
									);
									return;
								}
								const socket = new WebSocket(\`ws://localhost:\${port}\`);
								socket.onmessage = async (message) => {
									if (message.data === "css") {
										const new_link = make_new_link();
										new_link.onload = cleanup_css;
										document
											.querySelector("head")
											.appendChild(new_link);
									}
									if (message.data === "ts") {
										document.documentElement.classList.add(
											"restarting"
										);
										await wait_for_app_restart();
										document.documentElement.dispatchEvent(
											new Event("ts-rebuilt")
										);
										document.documentElement.classList.remove(
											"restarting"
										);
									}
								};
							})();
					  </script>`
					: ""}
			</body>
		</html>`;
}
