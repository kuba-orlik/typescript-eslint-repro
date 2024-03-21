import kill from "kill-port";
import type { KoaResponsiveImageRouter } from "koa-responsive-image-router";
import _locreq from "locreq";
import { FlatTemplatable } from "tempstream";
import TheApp from "./app.js";
import { PORT, SEALIOUS_SANITY } from "./config.js";
import { mainRouter } from "./routes/index.js";
import { module_dirname } from "./util.js";
const locreq = _locreq(module_dirname(import.meta.url));

const app = new TheApp();

void (async function () {
	await kill(PORT);
	await kill(PORT);

	try {
		app.HTTPServer.addStaticRoute("/", locreq.resolve("public"));
		await app.start();
		if (SEALIOUS_SANITY) {
			console.error("Exiting with error code 0");
			process.exit(0);
		}
		mainRouter(app.HTTPServer.router);
	} catch (error) {
		console.error(error);
		if (SEALIOUS_SANITY) {
			console.error("EXITING WITH STATUS 1");
			process.exit(1);
		}
	}
})();
