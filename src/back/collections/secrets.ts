import { Collection, FieldTypes } from "sealious";
import { Roles } from "../policy-types/roles";

/* For testing the Roles policy */
export class Secrets extends Collection {
	fields = {
		content: new FieldTypes.Text(),
	};
	defaultPolicy = new Roles(["admin"]);
}

export default new Secrets();
