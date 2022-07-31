import { hasShape, predicates, Shape, ShapeToType } from "@sealcode/ts-predicates";
import { BaseContext } from "koa";
import merge from "merge";
import { BasePageProps } from "./list";

export type EncodedProps = Record<string, unknown>;

// the intention here is to sometime in the future be able to store multiple frames on one document, so props for each frame will be in a different namespace, and parsers are going to help with that

function parseStringValues<TheShape extends Shape>(
	shape: TheShape,
	values: Record<string, string>
): ShapeToType<TheShape> {
	const result: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(values)) {
		if (!(key in shape)) {
			continue;
		}
		const predicate = shape[key];
		if (predicate == predicates.number) {
			result[key] = parseFloat(value);
		} else {
			result[key] = value;
		}
	}
	// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
	return result as ShapeToType<TheShape>;
}

export abstract class PagePropsParser<PropsType extends BasePageProps> {
	abstract decode(ctx: BaseContext): PropsType;
	abstract encode(props: PropsType): EncodedProps;
	abstract getHTMLInputName(prop_name: string): string;

	constructor(public propsShape: Shape, public defaultValues: Partial<PropsType>) {}

	overwriteProp(ctx: BaseContext, new_props: Partial<PropsType>): EncodedProps {
		const result = {};
		merge.recursive(result, this.decode(ctx), new_props);
		return result;
	}

	makeHiddenInputs(values: PropsType, fields_to_skip: string[]): string {
		return Object.entries(values)
			.filter(([key]) => !fields_to_skip.includes(key))
			.map(
				([key, value]: [string, string | number]) =>
					/* HTML */ `<input type="hidden" name="${key}" value="${value}" />`
			)
			.join(" ");
	}

	getDefaultValue<Key extends keyof PropsType>(key: Key): PropsType[Key] | undefined {
		return this.defaultValues[key];
	}
}

export class AllQueryParams<
	PropsType extends BasePageProps
> extends PagePropsParser<PropsType> {
	decode(ctx: BaseContext): PropsType {
		// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
		const query = parseStringValues(this.propsShape, {
			...this.defaultValues,
			...ctx.query,
		} as unknown as Record<string, string>);
		if (!hasShape(this.propsShape, query)) {
			throw new Error("Wrong props shape");
		}
		// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
		return query as PropsType;
	}

	encode(props: PropsType): Record<string, unknown> {
		return props;
	}

	getHTMLInputName(prop_name: string): string {
		return prop_name;
	}
}
