import _locreq from "locreq";
import Sealious from "sealious";
import TheApp from "./app";
import homepage from "./routes/homepage";
import tasks from "./routes/tasks";
import login from "./routes/login";
const locreq = _locreq(__dirname);

declare module "koa" {
	interface BaseContext {
		$context: Sealious.Context;
		$app: TheApp;
		$body: Record<string, unknown>;
	}
}

const app = new TheApp();
void app
	.start()
	.then(() => {
		//populate scripts go here
		if (process.env.SEALIOUS_SANITY === "true") {
			console.log("Exiting with error code 0");
			process.exit(0);
		}
	})
	.catch((error) => {
		console.error(error);
		if (process.env.SEALIOUS_SANITY === "true") {
			console.log("EXITING WITH STATUS 1");
			process.exit(1);
		}
	});

const router = app.HTTPServer.router;
router.use("/", homepage.routes());
router.use("/tasks", tasks.routes());
router.use("/login", login.routes());

app.HTTPServer.addStaticRoute("/", locreq.resolve("public"));
