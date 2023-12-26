import { Collection, FieldTypes } from "sealious";
import { Roles } from "../policy-types/roles.js";

/* For testing the Roles policy */
export default class Secrets extends Collection {
	fields = {
		content: new FieldTypes.Text(),
	};
	defaultPolicy = new Roles(["admin"]);
}
