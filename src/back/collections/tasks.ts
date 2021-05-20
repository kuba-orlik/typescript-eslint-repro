import { Collection, FieldTypes, Policies } from "sealious";

const tasks = new (class extends Collection {
	fields = {
		title: new FieldTypes.Text(),
		done: new (class extends FieldTypes.Boolean {
			hasDefaultValue = () => true;
			async getDefaultValue() {
				return false;
			}
		})(),
	};
	defaultPolicy = new Policies.Public();
})();

export default tasks;
