import kill from "kill-port";
import _locreq from "locreq";
import TheApp from "./app.js";
import { mainRouter } from "./routes/index.js";
import { module_dirname } from "./util.js";
const locreq = _locreq(module_dirname(import.meta.url));

const app = new TheApp();

kill(app.config["www-server"].port)
	.then(() => app.start())
	.then(async () => {
		if (process.env.SEALIOUS_SANITY === "true") {
			console.error("Exiting with error code 0");
			process.exit(0);
		}
		mainRouter(app.HTTPServer.router);
	})
	.catch((error) => {
		console.error(error);
		if (process.env.SEALIOUS_SANITY === "true") {
			console.error("EXITING WITH STATUS 1");
			process.exit(1);
		}
	});

app.HTTPServer.addStaticRoute("/", locreq.resolve("public"));
