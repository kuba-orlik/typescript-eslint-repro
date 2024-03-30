import { Controller } from "stimulus";

const APP_DOWN_ERROR_MESSAGE = "App is currently down";

const sleep = (time: number) =>
	new Promise((resolve) => {
		setTimeout(resolve, time);
	});

async function get_status(): Promise<{ started_at: number; status: string }> {
	const r = await fetch("/status.json");
	// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
	return (await r.json()) as { started_at: number; status: string };
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

	// eslint-disable-next-line no-constant-condition
	while (true) {
		// eslint-disable-next-line no-await-in-loop
		const { started_at } = await get_status().catch(() => ({
			started_at: first_timestamp,
		}));
		if (started_at !== first_timestamp) {
			return;
		}
		// eslint-disable-next-line no-await-in-loop
		await sleep(100);
	}
}

async function wait_for_app_to_be_stable(n = 3) {
	// eslint-disable-next-line no-console
	console.log("Waiting for app to be stable....");
	let counter = 0;
	// eslint-disable-next-line no-constant-condition
	while (true) {
		// eslint-disable-next-line no-await-in-loop
		const { status } = await get_status().catch(() => ({
			status: "down",
		}));
		if (status == "running") {
			// eslint-disable-next-line no-console
			console.log(counter);
			counter++;
		} else {
			counter = 0;
		}
		if (counter == n) {
			return;
		}
		// eslint-disable-next-line no-await-in-loop
		await sleep(100);
	}
}

async function wait_for_app_restart() {
	try {
		await wait_for_run_id_to_change();
	} catch (e) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		if (e.message !== APP_DOWN_ERROR_MESSAGE) {
			throw e;
		}
	}
	await wait_for_app_to_be_stable();
}

export default class RefreshOnTSChanges extends Controller {
	socket: WebSocket;

	async connect() {
		// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
		const { port, watch } = (await fetch("/dist/notifier.json").then((r) =>
			r.json()
		)) as { port: number; watch: boolean };
		if (!watch) {
			// eslint-disable-next-line no-console
			console.warn(
				"Not running auto refresh on watch because the build process is not running in watch mode"
			);
			return;
		}
		const socket = new WebSocket(`ws://localhost:${port}`);
		socket.onmessage = async (message) => {
			// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
			const data = message.data as unknown;
			if (typeof data === "string" && data.endsWith("-ts")) {
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
