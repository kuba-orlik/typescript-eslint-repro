import _locreq from "locreq";
import { resolve } from "path";
import { App } from "sealious";
import tasks from "./collections/tasks";
const locreq = _locreq(__dirname);

const PORT = process.env.SEALIOUS_PORT
	? parseInt(process.env.SEALIOUS_PORT)
	: 8080;
const base_url = process.env.SEALIOUS_BASE_URL || `http://localhost:${PORT}`;
const MONGO_PORT = process.env.SEALIOUS_MONGO_PORT
	? parseInt(process.env.SEALIOUS_MONGO_PORT)
	: 20723;
const MONGO_HOST = process.env.SEALIOUS_MONGO_HOST || "localhost";

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
			level: <const>"info",
		},
		"www-server": {
			port: PORT,
		},
	};
	manifest = {
		name: "Sealious Playground",
		logo: resolve(__dirname, "../assets/logo.png"),
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
		tasks,
	};
}
