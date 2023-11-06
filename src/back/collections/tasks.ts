import { Collection, FieldTypes, Policies } from "sealious";

export default class Tasks extends Collection {
	fields = {
		title: new FieldTypes.Text(),
		done: new (class extends FieldTypes.Boolean {
			hasDefaultValue = () => true;
			async getDefaultValue() {
				return false;
			}
		})(),
	};

	policies = {
		create: new Policies.Public(),
		show: new Policies.Owner(),
		list: new Policies.Owner(),
	};

	defaultPolicy = new Policies.Public();
}
