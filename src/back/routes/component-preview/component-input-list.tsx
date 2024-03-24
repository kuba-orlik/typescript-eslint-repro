import { ComponentArgument, List } from "@sealcode/jdd";
import { StatefulPage } from "@sealcode/sealgen";
import { TempstreamJSX } from "tempstream";
import { ComponentPreviewState } from "../components.sreact.js";
import { jdd_context } from "../jdd-context.js";
import { ComponentInput } from "./component-input.js";
import type { ComponentPreviewActions } from "./component-preview-actions.js";

export async function ComponentInputList<State extends ComponentPreviewState, T>({
	state,
	arg_path,
	arg,
	value,
	page,
}: {
	state: State;
	arg_path: string[];
	arg: List<T>;
	value: T[];
	page: StatefulPage<ComponentPreviewState, typeof ComponentPreviewActions>;
}) {
	if (!value) {
		value = [];
	}
	return (
		<fieldset>
			<legend>{arg_path.at(-1)}</legend>
			{value.map((value, i) => (
				<div style="display: flex">
					<ComponentInput
						{...{
							state,
							arg_path: [...arg_path, i.toString()],
							arg: arg.item_type,
							value,
							page,
						}}
					/>
					{page.makeActionButton(
						state,
						{ action: "remove_array_item", label: "❌" },
						arg_path,
						i
					)}
				</div>
			))}
			{page.makeActionButton(
				state,
				{
					action: "add_array_item",
					label: "➕",
				},
				arg_path,
				await arg.item_type.getExampleValue(jdd_context)
			)}
		</fieldset>
	);
}
