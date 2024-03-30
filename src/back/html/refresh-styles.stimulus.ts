import { Controller } from "stimulus";

function make_new_link() {
	const new_link = document.createElement("link");
	new_link.rel = "stylesheet";
	new_link.href = `/dist/main.css?${Math.random()}+${Math.random()}`;
	new_link.type = "text/css";
	return new_link;
}

function getStyles() {
	return Array.from(document.querySelectorAll("head link")).filter(
		(e: HTMLLinkElement) => new URL(e.href).pathname == "/dist/main.css"
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

export default class RefreshStyles extends Controller {
	socket: WebSocket;

	async connect() {
		const { port } = await fetch("/dist/notifier.json").then((r) => r.json());
		this.socket = new WebSocket(`ws://localhost:${port}`);
		this.socket.onmessage = async (message) => {
			if (message.data === "css") {
				const new_link = make_new_link();
				new_link.onload = cleanup_css;
				document.querySelector("head").appendChild(new_link);
			}
		};
		document.documentElement.addEventListener("turbo:morph", cleanup_css);
	}

	async disconnect() {
		this.socket.close();
		document.documentElement.removeEventListener("turbo:morph", cleanup_css);
	}
}
