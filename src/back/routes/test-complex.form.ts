import { BaseContext } from "koa";
import { tempstream } from "tempstream";
import { FormFieldControl, SimpleInput } from "../forms/controls";
import { FormField } from "../forms/field";
import Form, { FormData } from "../forms/form";
import html from "../html";

export const actionName = "TestComplex";

class NumberSum<Field1 extends string, Field2 extends string> extends FormFieldControl {
	constructor(public field1: Field1, public field2: Field2) {
		super([field1, field2]);
	}

	_render(_: BaseContext, __: FormField[], data: FormData<Field1 | Field2>) {
		return tempstream/*HTML */ `<div>Suma liczb ${this.field1} i ${
			this.field2
		} to: <strong>${
			// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
			parseInt(data.values[this.field1] as string) +
			// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
			parseInt(data.values[this.field2] as string)
		}</strong></div>`;
	}
}

export default new (class TestComplexForm extends Form {
	defaultSuccessMessage = "Formularz wypełniony poprawnie";

	fields = [
		new FormField("A", true),
		new FormField("B", true),
		new FormField("C", true),
	];

	controls = [
		new SimpleInput("A", { label: "A", type: "number" }),
		new SimpleInput("B", { label: "B", type: "number" }),
		new SimpleInput("C", { label: "B", type: "number" }),
		new NumberSum("A", "B"),
		new NumberSum("B", "C"),
	];

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async canAccess(_: BaseContext) {
		return { canAccess: true, message: "" };
	}

	async onSubmit() {
		//noop
		return;
	}

	async render(ctx: BaseContext, data: FormData, path: string) {
		return html(ctx, "TestComplex", await super.render(ctx, data, path));
	}
})();
