import _locreq from "locreq";
import { resolve } from "path";
import { App, LoggerMailer, SMTPMailer } from "sealious";
import tasks from "./collections/tasks";
import users from "./collections/users";
import PasswordResetIntents from "./collections/password-reset-intents";
import RegistrationIntents from "./collections/registration-intents";
import { UserRoles } from "./collections/user-roles";
import { LoggerLevel } from "sealious/@types/src/app/logger";
import { Secrets } from "./collections/secrets";
const locreq = _locreq(__dirname);

const PORT = process.env.SEALIOUS_PORT ? parseInt(process.env.SEALIOUS_PORT) : 8080;
const base_url = process.env.SEALIOUS_BASE_URL || `http://localhost:${PORT}`;
const MONGO_PORT = process.env.SEALIOUS_MONGO_PORT
	? parseInt(process.env.SEALIOUS_MONGO_PORT)
	: 20725;
const MONGO_HOST = process.env.SEALIOUS_MONGO_HOST || "127.0.0.1";

export default class TheApp extends App {
	config = {
		upload_path: locreq.resolve("uploaded_files"),
		datastore_mongo: {
			host: MONGO_HOST,
			port: MONGO_PORT,
			db_name: "sealious-playground",
		},
		email: {
			from_address: "sealious-playground@example.com",
			from_name: "Sealious playground app",
		},
		logger: {
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
		name: "Sealious Playground",
		logo: locreq.resolve("assets/logo.png"),
		version: "0.0.1",
		default_language: "en",
		base_url,
		admin_email: "admin@example.com",
		colors: {
			primary: "#5294a1",
		},
	};
	collections = {
		...App.BaseCollections,
		users,
		"registration-intents": new RegistrationIntents(),
		"password-reset-intents": new PasswordResetIntents(),
		"user-roles": new UserRoles(),
		tasks,
		secrets: new Secrets(),
	};
	mailer =
		process.env.SEALIOUS_MAILER === "mailcatcher"
			? new SMTPMailer({
					host: "mailcatcher",
					port: 1025,
					user: "any",
					password: "any",
			  })
			: new LoggerMailer();
}
