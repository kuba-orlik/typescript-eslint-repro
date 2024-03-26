import { render } from "@sealcode/jdd";
import { StateAndMetadata, StatefulPage, to_base64 } from "@sealcode/sealgen";
import { hasFieldOfType, hasShape, predicates } from "@sealcode/ts-predicates";
import { BaseContext } from "koa";
import { Templatable, TempstreamJSX } from "tempstream";
import html from "../html.js";
import { registry } from "../jdd-components/components.js";
import { ComponentInput } from "./component-preview/component-input.js";
import { ComponentPreviewActions } from "./component-preview/component-preview-actions.js";
import { jdd_context } from "./jdd-context.js";

export const actionName = "Components";

export type ComponentPreviewState = {
	component: string;
	component_args: Record<string, unknown>;
};

export default new (class ComponentsPage extends StatefulPage<
	ComponentPreviewState,
	typeof ComponentPreviewActions
> {
	actions = ComponentPreviewActions;

	async getInitialState() {
		const [component_name, component] = Object.entries(registry.getAll())[0];
		const initial_state = {
			component: component_name,
			component_args: await component.getExampleValues(jdd_context),
		};
		return initial_state;
	}

	wrapInLayout(ctx: BaseContext, content: Templatable): Templatable {
		return html(ctx, "Components", content, {
			morphing: false,
			preserveScroll: true,
			autoRefreshCSS: true,
			navbar: () => ``,
		});
	}

	wrapInForm(state: ComponentPreviewState, content: Templatable): Templatable {
		// overwriting this method in order to add enctype to form
		return (
			<form action="./" method="POST" enctype="multipart/form-data">
				<input
					name="state"
					type="hidden"
					value={to_base64(JSON.stringify(state))}
				/>
				{content}
			</form>
		);
	}

	async preprocessOverrides(
		state: ComponentPreviewState,
		overrides: Record<string, unknown>
	) {
		const component_name = state.component;
		if (!component_name) {
			throw new Error("Unspecified component name");
		}
		const component = registry.get(component_name);
		if (!component) {
			throw new Error(`Unknown component: ${component_name}`);
		}
		if (!hasShape({ component_args: predicates.object }, overrides)) {
			return overrides;
		}
		const promises = Object.entries(component.getArguments()).map(
			async ([arg_name, arg]) => {
				const value = overrides.component_args[arg_name];
				if (value) {
					const new_value = await arg.parseFormInput(
						jdd_context,
						value,
						arg_name
					);
					overrides.component_args[arg_name] = new_value;
				}
			}
		);
		await Promise.all(promises);
		// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
		return overrides;
	}

	render(_ctx: BaseContext, state: ComponentPreviewState) {
		const all_components = registry.getAll();
		const component =
			registry.get(state.component) || Object.values(all_components)[0];
		return (
			<div
				class="two-column"
				id="component-debugger"
				style="--resizable-column-width: 50vw"
			>
				<div class="resizable">
					{/*The below button has to be here in order for it to be the default behavior */}
					<input type="submit" value="Preview" />
					<select
						name="component"
						onchange={this.makeActionCallback("change_component")}
						autocomplete="off"
					>
						{Object.entries(all_components).map(([name]) => (
							<option value={name} selected={name == state.component}>
								{name}
							</option>
						))}
					</select>
					{this.makeActionButton(state, "randomize_args")}
					<fieldset class="component-preview-parameters">
						<legend>Parameters</legend>
						{Object.entries(component.getArguments()).map(
							async ([arg_name, arg]) => (
								<ComponentInput
									{...{
										state,
										arg_path: [arg_name],
										arg,
										value:
											state.component_args[arg_name] === undefined
												? await arg.getExampleValue(jdd_context)
												: state.component_args[arg_name],
										onblur: this.rerender(),
										page: this,
									}}
								/>
							)
						)}
						<input type="submit" value="Preview" />
					</fieldset>
					<code>{JSON.stringify(state)}</code>
				</div>
				<div class="resize-gutter"></div>
				<div class="component-preview">
					<fieldset>
						<legend>
							Preview <span id="component_width_span"></span>
						</legend>
						{render(
							registry,
							[
								{
									component_name: state.component,
									args: state.component_args,
								},
							],
							jdd_context
						)}
					</fieldset>
					{
						/* HTML */ `<script>
							(function () {
								function update_width_display() {
									const component_width =
										document.getElementsByClassName(
											"component-preview"
										)[0].offsetWidth;
									document.getElementById(
										"component_width_span"
									).innerHTML = \`(width: \${component_width}px)\`;
								}
								window.addEventListener("load", (event) => {
									update_width_display();
								});
								document.addEventListener(
									"turbo:render",
									update_width_display
								);
								let is_resizing = false;
								let origin_x;
								let origin_width;
								const gutter = document.querySelector(".resize-gutter");
								const resizable = document.querySelector(".resizable");
								const move_listener = (e) => {
									const new_width = Math.max(
										origin_width + (e.clientX - origin_x),
										1
									);
									document
										.getElementById("component-debugger")
										.style.setProperty(
											"--resizable-column-width",
											new_width + "px"
										);
									update_width_display();
								};
								gutter.addEventListener("mousedown", (e) => {
									is_resizing = true;
									origin_x = e.clientX;
									origin_width =
										resizable.getBoundingClientRect().width;
									document.addEventListener("mousemove", move_listener);
									document.addEventListener("mouseup", () => {
										document.removeEventListener(
											"mousemove",
											move_listener
										);
									});
									e.preventDefault();
								});
							})();
						</script>`
					}
				</div>
				{
					/* HTML */ `<script>
						const main_form = document
							.querySelector("#component-debugger")
							.closest("form");
						document.documentElement.addEventListener("ts-rebuilt", () => {
							main_form.requestSubmit();
						});
						main_form.addEventListener("turbo:submit-end", () => {
							// this clears the values of file inputs, so they don't get unecessarily
							// re-uploaded on future submissions - the file is alreade there on the server
							main_form
								.querySelectorAll("input[type=file]")
								.forEach((input) => (input.value = ""));
						});
					</script>`
				}
			</div>
		);
	}
})();
