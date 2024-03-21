import { ComponentArgument, Structured } from "@sealcode/jdd";
import { StatefulPage } from "@sealcode/sealgen";
import { TempstreamJSX } from "tempstream";
import { ComponentPreviewState } from "../components.sreact.js";
import { ComponentInput } from "./component-input.js";
import { ComponentPreviewActions } from "./component-preview-actions.js";

export function ComponentInputStructured<
	T extends Structured<Record<string, ComponentArgument<unknown>>>
>({
	state,
	arg_path,
	arg,
	value,
	rerender_callback,
	page,
}: {
	state: ComponentPreviewState;
	arg_path: string[];
	arg: T;
	value: Record<string, unknown>;
	rerender_callback?: string;
	page: StatefulPage<ComponentPreviewState, typeof ComponentPreviewActions>;
}) {
	return (
		<fieldset>
			<legend>{arg_path.at(-1)}</legend>
			{Object.entries(arg.structure).map(([arg_name, arg]) => (
				<div>
					<ComponentInput
						{...{
							state,
							arg_path: [...arg_path, arg_name],
							arg,
							value: value[arg_name],
							rerender_callback,
							page,
						}}
					/>
				</div>
			))}
		</fieldset>
	);
}
