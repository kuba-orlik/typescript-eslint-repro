import _locreq from "locreq";
import { default as Sealious, App, LoggerMailer, SMTPMailer } from "sealious";
import { LoggerLevel } from "sealious/@types/src/app/logger";
import { collections } from "./collections/collections";
import ADMIN_CREDENTIALS from "./default-admin-credentials";
const locreq = _locreq(__dirname);

const PORT = process.env.SEALIOUS_PORT ? parseInt(process.env.SEALIOUS_PORT) : 8080;
const base_url = process.env.SEALIOUS_BASE_URL || `http://localhost:${PORT}`;
const MONGO_PORT = process.env.SEALIOUS_MONGO_PORT
	? parseInt(process.env.SEALIOUS_MONGO_PORT)
	: 20747;
const MONGO_HOST = process.env.SEALIOUS_MONGO_HOST || "127.0.0.1";

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
		base_url,
		admin_email: ADMIN_CREDENTIALS.email,
		colors: {
			primary: "#5294a1",
		},
	};
	collections = collections;
	mailer =
		process.env.SEALIOUS_MAILER === "mailcatcher"
			? new SMTPMailer({
					host: "mailcatcher",
					port: 1025,
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
