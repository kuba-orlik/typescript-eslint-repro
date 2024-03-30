import { Controller } from "stimulus";

const APP_DOWN_ERROR_MESSAGE = "App is currently down";

const sleep = (time: number) =>
	new Promise((resolve) => {
		setTimeout(resolve, time);
	});

async function get_status() {
	const r = await fetch("/status.json");
	return await r.json();
}

async function wait_for_run_id_to_change() {
	let first_timestamp: number;
	try {
		const { started_at } = await get_status();
		first_timestamp = started_at;
	} catch (e) {
		await wait_for_app_to_be_stable();
		return;
	}

	if (!first_timestamp) {
		throw new Error(APP_DOWN_ERROR_MESSAGE);
	}

	while (true) {
		const { started_at } = await get_status().catch(() => ({
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
		const { status } = await get_status().catch(() => ({
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

export default class RefreshOnTSChanges extends Controller {
	socket: WebSocket;

	async connect() {
		const { port, watch } = await fetch("/dist/notifier.json").then((r) => r.json());
		if (!watch) {
			console.warn(
				"Not running auto refresh on watch because the build process is not running in watch mode"
			);
			return;
		}
		const socket = new WebSocket(`ws://localhost:${port}`);
		socket.onmessage = async (message) => {
			if (message.data.endsWith("-ts")) {
				document.documentElement.classList.add("restarting");
				await wait_for_app_restart();
				document.documentElement.dispatchEvent(new Event("ts-rebuilt"));
				document.documentElement.classList.remove("restarting");
			}
		};
	}

	async disconnect() {
		this.socket.close();
	}
}
