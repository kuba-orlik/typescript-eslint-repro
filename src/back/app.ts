import _locreq from "locreq";
import { resolve } from "path";
import { App } from "sealious";
import tasks from "./collections/tasks";
const locreq = _locreq(__dirname);

export default class TheApp extends App {
	config = {
		upload_path: locreq.resolve("uploaded_files"),
		datastore_mongo: {
			host: "localhost",
			port: 20723,
			db_name: "sealious-playground",
		},
		email: {
			from_address: "sealious-playground@example.com",
			from_name: "Sealious playground app",
		},
		logger: {
			level: <const>"info",
		},
	};
	manifest = {
		name: "Sealious Playground",
		logo: resolve(__dirname, "../assets/logo.png"),
		version: "0.0.1",
		default_language: "en",
		base_url: "localhost:8080",
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
