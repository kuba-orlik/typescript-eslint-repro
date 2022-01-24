import TheApp from "../app";
import { mainRouter } from "../routes";
import _locreq from "locreq";

const locreq = _locreq(__dirname);
import Sealious, { SMTPMailer } from "sealious";
import { TestUtils } from "sealious";

declare module "koa" {
	interface BaseContext {
		$context: Sealious.Context;
		$app: TheApp;
		$body: Record<string, unknown>;
	}
}

export async function withProdApp(
	callback: (args: {
		app: TheApp;
		base_url: string;
		rest_api: TestUtils.MockRestApi;
		mail_api: TestUtils.MailcatcherAPI;
	}) => Promise<void>
) {
	const app = new TheApp();
	const port = 9999;

	app.config["www-server"].port = port;
	app.config.datastore_mongo = {
		host: "db",
		port: 27017,
		db_name: "sealious-playground-test",
	};
	app.config.logger.level = <const>"none";
	app.mailer = new SMTPMailer({
		host: "mailcatcher",
		port: 1025,
		user: "any",
		password: "any",
	});

	await app.start();
	mainRouter(app.HTTPServer.router);

	app.HTTPServer.addStaticRoute("/", locreq.resolve("public"));

	const base_url = `http://127.0.0.1:${port}`;
	const mail_api = new TestUtils.MailcatcherAPI("http://mailcatcher:1080", app);
	await mail_api.deleteAllInstanceEmails();

	async function stop() {
		await app.removeAllData();
		await app.stop();
	}

	try {
		await callback({
			app,
			base_url,
			rest_api: new TestUtils.MockRestApi(base_url),
			mail_api,
		});
		await stop();
	} catch (e) {
		await stop();
		console.error(e);
		throw e;
	}
}
