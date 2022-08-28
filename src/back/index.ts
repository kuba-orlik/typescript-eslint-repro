import _locreq from "locreq";
import TheApp from "./app";
import { mainRouter } from "./routes";
const locreq = _locreq(__dirname);

const app = new TheApp();

app.start()
	.then(async () => {
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
