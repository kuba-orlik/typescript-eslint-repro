import { FormField } from "./field";

export class FormFieldsList {
	static getField(fields: FormField[], name: string) {
		return fields.find((f) => f.name == name);
	}
}
