import { is, predicates } from "@sealcode/ts-predicates";
import { BaseContext } from "koa";

export type FormFieldValidationResponse = { valid: boolean; message: string };

export type FormFieldValidationFn = (
	ctx: BaseContext,
	value: unknown,
	field: FormField
) => Promise<FormFieldValidationResponse>;

export class FormField<Fieldnames extends string = string> {
	constructor(
		public name: Fieldnames,
		public required: boolean = false,
		public validator: FormFieldValidationFn = async () => ({
			valid: true,
			message: "",
		})
	) {}

	public async _validate(
		ctx: BaseContext,
		value: unknown
	): Promise<FormFieldValidationResponse> {
		if (this.required && (value == "" || value == null || value == undefined)) {
			return { valid: false, message: "This field is required" };
		}
		return this.validator(ctx, value, this);
	}

	public getEmptyValue() {
		return "";
	}
}

export class PickFromListField<
	Fieldnames extends string = string
> extends FormField<Fieldnames> {
	constructor(
		public name: Fieldnames,
		public required: boolean = false,
		public generateOptions: (
			ctx: BaseContext
		) => Promise<Record<string, string> | { [i: string]: string }>,
		public customValidation: (
			ctx: BaseContext,
			value: unknown,
			instance: PickFromListField
		) => Promise<FormFieldValidationResponse> = (ctx, value, instance) =>
			instance.valueInList(ctx, value)
	) {
		super(name, required, (ctx, value) => this.customValidation(ctx, value, this));
	}

	async valueInList(
		ctx: BaseContext,
		value: unknown
	): Promise<FormFieldValidationResponse> {
		const options = await this.generateOptions(ctx);
		if (!is(value, predicates.string)) {
			return { valid: false, message: "not a string" };
		}
		if (!Object.keys(options).includes(value)) {
			return { valid: false, message: `"${value}" is not one of the options` };
		}
		return { valid: true, message: "" };
	}
}

export class ChekboxedListField<
	Fieldnames extends string = string
> extends FormField<Fieldnames> {
	constructor(
		public name: Fieldnames,
		public required: boolean = false,
		public generateOptions: (
			ctx: BaseContext
		) => Promise<Record<string, string> | { [i: string]: string }>,
		public isVisible: (ctx: BaseContext) => Promise<boolean> = () =>
			Promise.resolve(true)
	) {
		super(name, required, (ctx, value) => this.isValueValid(ctx, value));
	}

	private async isValueValid(
		_: BaseContext,
		value: unknown
	): Promise<FormFieldValidationResponse> {
		if (is(value, predicates.string)) {
			return { valid: false, message: "you need an array" };
		}
		if (is(value, predicates.null)) {
			return { valid: false, message: "you need an array" };
		}
		return { valid: true, message: "" };
	}
}

export class NumberField<
	Fieldnames extends string = string
> extends FormField<Fieldnames> {
	constructor(field_name: Fieldnames, required: boolean) {
		super(field_name, required, (_, value) => this.isValueValid(_, value));
	}

	private async isValueValid(_: BaseContext, value: unknown) {
		if (
			(is(value, predicates.string) &&
				!isNaN(parseFloat(value)) &&
				parseFloat(value).toString() == value.trim()) ||
			is(value, predicates.number) ||
			((is(value, predicates.undefined) || value == "") && !this.required)
		) {
			return { valid: true, message: "" };
		}
		return { valid: false, message: "Proszę wprowadzić liczbę" };
	}
}
