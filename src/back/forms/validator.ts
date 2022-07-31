import { BaseContext } from "koa";
import { Field } from "sealious";
import { FormFieldValidationFn } from "./field";

export function collectionFieldValidator(field: Field): FormFieldValidationFn {
	return async (ctx: BaseContext, value) => {
		const { valid, reason } = await field.checkValue(ctx.$context, value, undefined);
		return { valid, message: reason || (valid ? "Wrong value" : "") };
	};
}
