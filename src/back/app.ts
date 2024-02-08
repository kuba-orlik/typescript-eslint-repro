import _locreq from "locreq";
import Sealious, { App, LoggerMailer, SMTPMailer } from "sealious";
import type { LoggerLevel } from "sealious/@types/src/app/logger.js";
import { collections } from "./collections/collections.js";
import {
	BASE_URL,
	MAILCATCHER_HOST,
	MAILCATCHER_SMTP_PORT,
	MAILER,
	MONGO_HOST,
	MONGO_PORT,
	PORT,
} from "./config.js";
import ADMIN_CREDENTIALS from "./default-admin-credentials.js";
import { module_dirname } from "./util.js";
const locreq = _locreq(module_dirname(import.meta.url));

declare module "koa" {
	interface BaseContext {
		$context: Sealious.Context;
		$app: TheApp;
	}
}

export default class TheApp extends App {
	config = {
		upload_path: locreq.resolve("uploaded_files"),
		datastore_mongo: {
			host: MONGO_HOST,
			port: MONGO_PORT,
			db_name: "sealious-app",
		},
		email: {
			from_address: "sealious-app@example.com",
			from_name: "sealious-app app",
		},
		logger: {
			// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
			level: "info" as LoggerLevel,
		},
		"www-server": {
			port: PORT,
		},
		core: {
			environment: <const>"production", // to send the full html emails
		},
	};
	manifest = {
		name: "sealious-app",
		logo: locreq.resolve("assets/logo.png"),
		version: "0.0.1",
		default_language: "en",
		base_url: BASE_URL,
		admin_email: ADMIN_CREDENTIALS.email,
		colors: {
			primary: "#5294a1",
		},
	};
	collections = collections;
	mailer =
		MAILER === "mailcatcher"
			? new SMTPMailer({
					host: MAILCATCHER_HOST,
					port: MAILCATCHER_SMTP_PORT,
					user: "any",
					password: "any",
			  })
			: new LoggerMailer();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any

	async start() {
		await super.start();
	}

	async stop() {
		await super.stop();
	}
}
