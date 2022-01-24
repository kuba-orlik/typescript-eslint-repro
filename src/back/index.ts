import _locreq from "locreq";
import Sealious from "sealious";
import TheApp from "./app";
import { mainRouter } from "./routes";
const locreq = _locreq(__dirname);

declare module "koa" {
	interface BaseContext {
		$context: Sealious.Context;
		$app: TheApp;
		$body: Record<string, unknown>;
	}
}

const app = new TheApp();

app.start()
	.then(async () => {
		await app.collections.users.populate();
		if (process.env.SEALIOUS_SANITY === "true") {
			console.log("Exiting with error code 0");
			process.exit(0);
		}
		mainRouter(app.HTTPServer.router);
	})
	.catch((error) => {
		console.error(error);
		if (process.env.SEALIOUS_SANITY === "true") {
			console.log("EXITING WITH STATUS 1");
			process.exit(1);
		}
	});

app.HTTPServer.addStaticRoute("/", locreq.resolve("public"));
