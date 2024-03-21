import _locreq from "locreq";
import { module_dirname } from "./util.js";
const locreq = _locreq(module_dirname(import.meta.url));
export const SEALIOUS_SANITY = Boolean(process.env.SEALIOUS_SANITY);
export const PORT = process.env.SEALIOUS_PORT
	? parseInt(process.env.SEALIOUS_PORT)
	: 8080;
export const BASE_URL = process.env.SEALIOUS_BASE_URL || `http://localhost:${PORT}`;
export const MONGO_PORT = process.env.SEALIOUS_MONGO_PORT
	? parseInt(process.env.SEALIOUS_MONGO_PORT)
	: 20747;
export const MONGO_HOST = process.env.SEALIOUS_MONGO_HOST || "127.0.0.1";
export const MAILCATCHER_HOST = process.env.SEALIOUS_MAILCATCHER_HOST || "127.0.0.1";
export const MAILCATCHER_SMTP_PORT = parseInt(
	process.env.SEALIOUS_MAILCATCHER_SMTP_PORT || "1026"
);
export const MAILCATCHER_API_PORT = parseInt(
	process.env.SEALIOUS_MAILCATCHER_API_PORT || "1082"
);
export const MAILER = process.env.SEALIOUS_MAILER;
export const DEFAULT_HTML_LANG = "pl";

export const IMAGE_CACHE_FS_DIR =
	process.env.IMAGE_CACHE_FS_DIR || locreq.resolve("cache/images");
export const SMARTCROP_CACHE_FS_DIR =
	process.env.IMAGE_CACHE_FS_DIR || locreq.resolve("cache/smartcrop");
