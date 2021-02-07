import _locreq from "locreq";
import Sealious from "sealious";
import TheApp from "./app";
import homepage from "./routes/homepage";
import tasks from "./routes/tasks";
const locreq = _locreq(__dirname);

declare module "koa" {
	interface BaseContext {
		$context: Sealious.Context;
		$app: TheApp;
		$body: Record<string, unknown>;
	}
}

const app = new TheApp();
app.start();

const router = app.HTTPServer.router;
router.use("/", homepage.routes());
router.use("/tasks", tasks.routes());

app.HTTPServer.addStaticRoute("/", locreq.resolve("public"));
