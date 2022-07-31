import { BaseContext } from "koa";
import { hasShape, is, predicates } from "@sealcode/ts-predicates";
import { Collection, Errors } from "sealious";
import { ItemFields } from "sealious/@types/src/chip-types/collection-item-body";

export interface CollectionTiedFormData<C extends Collection> {
	values: Partial<{ [field in keyof ItemFields<C>]: string }>;
	errors?: Errors.FieldsError<C>;
}

export interface FormFields<Fields extends string> {
	values: Partial<{ [field in Fields]: string }>;
	errors?: Partial<{ [field in Fields]: string }>;
}

export function formHasAllFields<Fields extends readonly string[]>(
	ctx: BaseContext,
	fields: Fields,
	obj: unknown
): obj is { [field in Fields[number]]: string } {
	const valid =
		is(obj, predicates.object) &&
		hasShape(
			Object.fromEntries(fields.map((field) => [field, predicates.string])),
			obj
		);
	if (!valid) {
		ctx.status = 422;
		if (is(obj, predicates.object)) {
			ctx.body = `Missing params: ${fields
				.filter((field) => !Object.keys(obj).includes(field))
				.join(", ")}`;
		}
	}
	return valid;
}

export function formHasSomeFields<Fields extends readonly string[]>(
	ctx: BaseContext,
	fields: Fields,
	obj: unknown
): obj is Partial<{ [field in Fields[number]]: string }> {
	const valid =
		is(obj, predicates.object) &&
		hasShape(
			Object.fromEntries(fields.map((field) => [field, predicates.string])),
			obj
		);
	if (!valid) {
		ctx.status = 422;
		ctx.body = "Wrong type of params, expected string or undefined";
	}
	return valid;
}
