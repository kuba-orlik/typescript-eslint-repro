import {
	ComponentArgument,
	List,
	render,
	simpleJDDContext,
	Structured,
} from "@sealcode/jdd";
import { StateAndMetadata, StatefulPage, to_base64 } from "@sealcode/sealgen";
import { hasFieldOfType, hasShape, is, predicates } from "@sealcode/ts-predicates";
import { BaseContext } from "koa";
import { Templatable, TempstreamJSX } from "tempstream";
import html from "../html.js";
import { registry } from "../jdd-components/components.js";
import { ComponentInput } from "./component-preview/component-input.js";
import { ComponentPreviewActions } from "./component-preview/component-preview-actions.js";
import { jdd_context } from "./jdd-context.js";

export const actionName = "Components";

function id<X>(_: any, __: any, x: X): X {
	return x;
}

async function encodeSealiousFile(maybe_file: Record<string, unknown>) {
	if (maybe_file?.getDataPath) {
		return simpleJDDContext.encode_file(
			{
				type: "path",
				// asserting that this is an instance of sealious' FileFromPath
				path: (maybe_file as unknown as { data: { path: string } }).data
					.path as string,
			},
			false
		);
	}
}

const componentArgToRequestProcessor = {
	list: async function (arg, arg_name, value: unknown) {
		if (
			!is(value, predicates.array(predicates.object)) &&
			!is(value, predicates.object)
		) {
			throw new Error(`$.${arg_name} is not a list or object`);
		}
		const values = Array.isArray(value) ? value : Object.values(value);
		const nested_arg_type = (arg as List<ComponentArgument<unknown>>).item_type;
		let array_result: Array<unknown> = await Promise.all(
			values.map((value, index) => {
				return (
					componentArgToRequestProcessor[nested_arg_type.getTypeName()] || id
				)(nested_arg_type, `${arg_name}[${index}]`, value);
			})
		);
		if (nested_arg_type.getTypeName() != "list") {
			array_result = array_result.flat();
		}
		return array_result;
	},
	structured: async function (arg, arg_name, value) {
		if (!is(value, predicates.object)) {
			throw new Error(`${arg_name} is not an object`);
		}
		let result = Object.fromEntries(
			await Promise.all(
				Object.entries(value).map(async ([obj_key, obj_value]) => {
					const nested_arg_type: ComponentArgument<unknown> = (
						arg as Structured<Record<string, ComponentArgument<unknown>>>
					).structure[obj_key];
					if (!nested_arg_type) {
						return [obj_key, null];
					}
					const new_value = await (
						componentArgToRequestProcessor[nested_arg_type.getTypeName()] ||
						id
					)(arg, `${arg_name}[${obj_key}]`, obj_value);
					return [obj_key, new_value];
				})
			)
		);

		// if we're in a list and any of the values return an array, we will multiply the object
		if (arg.hasParent("list")) {
			const keys_with_unexpected_arrays = Object.entries(result)
				.filter(([key, value]) => {
					const nested_arg_type: ComponentArgument<unknown> = (
						arg as Structured<Record<string, ComponentArgument<unknown>>>
					).structure[key];
					return (
						nested_arg_type.getTypeName() !== "list" && Array.isArray(value)
					);
				})
				.map(([key]) => key);

			if (keys_with_unexpected_arrays.length > 1) {
				throw new Error(
					"Multiplying on multiple fields at the same time is not implemented yet"
				);
			}
			if (keys_with_unexpected_arrays.length == 1) {
				const key = keys_with_unexpected_arrays[0];
				const old_result = result;
				result = (old_result[key] as Array<unknown>).map((value) => ({
					...old_result,
					[key]: value,
				}));
			}
		}
		return result;
	},
	image: async function (arg, _, value: unknown) {
		if (
			!hasShape(
				{
					new: predicates.maybe(predicates.array(predicates.object)),
					old: predicates.string,
				},
				value
			)
		) {
			return null;
		}
		const files = (value.new || []).filter((e) => e);
		if (files.length == 0) {
			return value.old;
		} else if (files.length == 1) {
			return encodeSealiousFile(files[0]);
		} else if (arg.hasParent("list")) {
			return Promise.all(files.map(encodeSealiousFile));
		}
	},
} as Record<
	string,
	(arg: ComponentArgument<any>, arg_name: string, value: unknown) => Promise<unknown>
>;

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

	async preprocessRequestBody<
		T extends StateAndMetadata<ComponentPreviewState, typeof ComponentPreviewActions>
	>(values: Record<string, unknown>): Promise<T> {
		let old_component = hasFieldOfType(values, "component", predicates.string)
			? values.component
			: null;

		const new_component = hasShape(
			{ $: predicates.shape({ component: predicates.string }) },
			values
		)
			? values.$.component
			: null;

		const component_name = new_component || old_component;
		if (!component_name) {
			throw new Error("Unspecified component name");
		}
		const component = registry.get(component_name);
		if (!component) {
			throw new Error(`Unknown component: ${component_name}`);
		}
		if (
			!hasShape(
				{ $: predicates.shape({ component_args: predicates.object }) },
				values
			)
		) {
			// no component args to overwrite
			return values as T;
		}
		for (const [arg_name, arg] of Object.entries(component.getArguments())) {
			let value = values.$.component_args[arg_name];
			if (value) {
				const new_value = await (
					componentArgToRequestProcessor[arg.getTypeName()] || id
				)(arg, arg_name, value);
				values.$.component_args[arg_name] = new_value;
			}
		}
		return values as T;
	}

	render(
		ctx: BaseContext,
		state: ComponentPreviewState,
		inputs: Record<string, string>
	) {
		const all_components = registry.getAll();
		const component =
			registry.get(state.component) || Object.values(all_components)[0];
		return (
			<div class="two-column" id="component-debugger">
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
				{
					/* HTML */ `<script>
						(function () {
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
								document.documentElement.style.setProperty(
									"--resizable-column-width",
									new_width + "px"
								);
							};
							gutter.addEventListener("mousedown", (e) => {
								is_resizing = true;
								origin_x = e.clientX;
								origin_width = resizable.getBoundingClientRect().width;
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
				<div class="component-preview">
					<fieldset>
						<legend>Preview</legend>
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
