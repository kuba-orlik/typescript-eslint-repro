import { Collection, FieldTypes, Policies } from "sealious";

const tasks = new (class extends Collection {
	fields = {
		title: new FieldTypes.Text(),
		done: new FieldTypes.Boolean(),
	};
	defaultPolicy = new Policies.Public();
})();

export default tasks;
