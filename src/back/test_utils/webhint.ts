import _locreq from "locreq";
const locreq = _locreq(__dirname);
import { spawn } from "child_process";
import { hasShape, is, predicates } from "@sealcode/ts-predicates";
import { promises as fs } from "fs";

export const LONG_TEST_TIMEOUT = 100 * 1000;
export const VERY_LONG_TEST_TIMEOUT = 75 * 1000;

export async function webhintURL(url: string, config = locreq.resolve(".hintrc")) {
	// eslint-disable-next-line no-console
	console.log("scanning with webhint....", url);
	try {
		const subprocess = spawn(
			"node",
			[locreq.resolve("node_modules/.bin/hint"), "--config", config, url],
			{
				stdio: "inherit",
				shell: true,
			}
		);
		await new Promise<void>((resolve, reject) => {
			subprocess.on("close", (code) =>
				code === 0 ? resolve() : reject(new Error("Webhint tests failed"))
			);
		});
	} catch (e) {
		if (is(e, predicates.object) && hasShape({ stdout: predicates.string }, e)) {
			throw new Error(e.stdout);
		} else {
			throw e;
		}
	}
}

export async function webhintHTML(html: string) {
	await fs.writeFile("/tmp/index.html", html);
	await webhintURL("/tmp/index.html", locreq.resolve(".hintrc.local.json"));
}
