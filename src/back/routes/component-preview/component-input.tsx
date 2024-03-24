import { Enum, Image, List, Structured, Table, TableData } from "@sealcode/jdd";
import { ComponentArgument } from "@sealcode/jdd";
import { StatefulPage } from "@sealcode/sealgen";
import { TempstreamJSX } from "tempstream";
import { ComponentPreviewState } from "../components.sreact.js";
import { ComponentInputEnum } from "./component-input-enum.js";
import { ComponentInputImage } from "./component-input-image.js";
import { ComponentInputList } from "./component-input-list.js";
import { ComponentInputStructured } from "./component-input-structured.js";
import { ComponentInputTable } from "./component-input-table.js";
import { printArgPath } from "./print-arg-path.js";

export function ComponentInput<State extends ComponentPreviewState, T>({
	state,
	arg_path,
	arg,
	value,
	page,
}: {
	state: State;
	arg_path: string[];
	arg: ComponentArgument<T>;
	value: T;
	page: StatefulPage<any, any>;
}) {
	if (value === undefined) {
		value = arg.getEmptyValue();
	}
	if (arg instanceof List) {
		return ComponentInputList({ state, arg_path, arg, value: value as T[], page });
	}

	if (arg instanceof Structured) {
		return ComponentInputStructured({
			state,
			arg_path,
			arg,
			value: value as Record<string, unknown>,
			page,
		});
	}

	if (arg instanceof Enum) {
		return ComponentInputEnum({
			state,
			arg_path,
			arg,
			value: value as string,
			onchange: page.rerender(),
		});
	}

	if (arg instanceof Image) {
		return ComponentInputImage({
			state,
			arg_path,
			arg,
			value: value as string,
			page,
		});
	}

	if (arg instanceof Table) {
		return ComponentInputTable({
			state,
			arg_path,
			arg,
			value: value as TableData<unknown, unknown>,
			page,
		});
	}

	return (
		<div>
			<label>
				{arg_path.at(-1) || ""}
				{arg.getTypeName() == "markdown" ? (
					<textarea
						name={`$.component_args${printArgPath(arg_path)}`}
						onblur={page.rerender()}
						cols="40"
					>
						{value as string}
					</textarea>
				) : (
					<input
						type="text"
						name={`$.component_args${printArgPath(arg_path)}`}
						value={value as string}
						size="40"
					/>
				)}
			</label>
		</div>
	);
}
