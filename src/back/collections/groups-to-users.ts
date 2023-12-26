import { Collection, FieldTypes, Policies } from "sealious";
import { Roles } from "../policy-types/roles.js";

export default class GroupsToUsers extends Collection {
	fields = {
		user: new FieldTypes.SingleReference("users"),
		group: new FieldTypes.SingleReference("groups"),
	};
	defaultPolicy = new Roles(["admin"]);
	policies = {
		show: new Policies.Or([
			new Roles(["admin"]),
			new Policies.UserReferencedInField("user"),
		]),
		list: new Policies.Or([
			new Roles(["admin"]),
			new Policies.UserReferencedInField("user"),
		]),
	};
}
