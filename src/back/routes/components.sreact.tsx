import { TempstreamJSX, Templatable } from "tempstream";
import { BaseContext } from "koa";
import { StatefulPage } from "@sealcode/sealgen";
import html from "../html.js";
import { registry } from "../jdd-components/components.js";
import { render, simpleJDDContext } from "@sealcode/jdd";

export const actionName = "Components";

const actions = {
	add: (state: State, inputs: Record<string, string>) => {
		console.log({ inputs });
		return {
			...state,
			elements: [...state.elements, inputs.element_to_add || "new element"],
		};
	},
	remove: (state: State, _: unknown, index_to_remove: number) => {
		return {
			...state,
			elements: state.elements.filter((_, index) => index != index_to_remove),
		};
	},
} as const;

type State = {
	component: string;
	args: Record<string, unknown>;
};

export default new (class ComponentsPage extends StatefulPage<State, typeof actions> {
	actions = actions;

	getInitialState() {
		return { component: "", args: {} };
	}

	wrapInLayout(ctx: BaseContext, content: Templatable): Templatable {
		return html(ctx, "Components", content);
	}

	render(ctx: BaseContext, state: State, inputs: Record<string, string>) {
		const all_components = registry.getAll();
		const component =
			registry.get(state.component) || Object.values(all_components)[0];
		return (
			<div>
				<div>{JSON.stringify(state)}</div>
				<select name="$.component" onchange="this.closest('form').submit()">
					{Object.entries(all_components).map(([name]) => (
						<option value={name} selected={name == state.component}>
							{name}
						</option>
					))}
				</select>
				<fieldset>
					<legend>Parameters</legend>
					{Object.entries(component.getArguments()).map(([arg_name, arg]) => (
						<div>
							<label>
								{arg_name}
								{arg.getTypeName() == "markdown" ? (
									<textarea name={`$.args[${arg_name}]`}>
										{state.args[arg_name] as string}
									</textarea>
								) : (
									<input
										type="text"
										name={`$.args[${arg_name}]`}
										value={state.args[arg_name] as string}
									/>
								)}
							</label>
						</div>
					))}
					<input type="submit" value="Preview" />
				</fieldset>
				<fieldset>
					<legend>Preview</legend>
					{render(
						registry,
						[{ component_name: state.component, args: state.args }],
						simpleJDDContext
					)}
				</fieldset>
			</div>
		);
	}
})();
