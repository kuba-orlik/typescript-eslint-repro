import _locreq from "locreq";
import { v4 as uuid } from "uuid";

const locreq = _locreq(module_dirname(import.meta.url));
import { SMTPMailer } from "sealious";
import { TestUtils } from "sealious";
import TheApp from "../app.js";
import { mainRouter } from "../routes/index.js";
import { module_dirname } from "../util.js";
import getPort from "get-port";
import {
	MAILCATCHER_API_PORT,
	MAILCATCHER_HOST,
	MAILCATCHER_SMTP_PORT,
} from "../config.js";

const port_numbers = async function* () {
	yield await getPort();
};

export async function withProdApp(
	callback: (args: {
		app: TheApp;
		base_url: string;
		rest_api: TestUtils.MockRestApi;
		mail_api: TestUtils.MailcatcherAPI;
	}) => Promise<void>
) {
	const app = new TheApp();
	const port = (await port_numbers().next()).value as number;

	app.config["www-server"].port = port;
	app.config.datastore_mongo = {
		...app.config.datastore_mongo,
		db_name: "sealious-app-test" + uuid(),
	};
	app.config.logger.level = <const>"none";
	app.mailer = new SMTPMailer({
		host: "127.0.0.1",
		port: MAILCATCHER_SMTP_PORT,
		user: "any",
		password: "any",
	});

	mainRouter(app.HTTPServer.router);

	app.HTTPServer.addStaticRoute("/", locreq.resolve("public"));

	await app.start();
	const base_url = `http://127.0.0.1:${port}`;
	const mail_api = new TestUtils.MailcatcherAPI(
		`http://${MAILCATCHER_HOST}:${MAILCATCHER_API_PORT}`,
		app
	);
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
		if (app.status !== "stopped") {
			await stop();
		}
		console.error(e);
		throw e;
	}
}
