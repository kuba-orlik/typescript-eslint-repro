import { TempstreamJSX, Templatable, FlatTemplatable, tempstream } from "tempstream";
import { BaseContext } from "koa";
import { StatefulPage } from "@sealcode/sealgen";
import html from "../html.js";
import { registry } from "../jdd-components/components.js";
import {
	ComponentArgument,
	Enum,
	List,
	render,
	simpleJDDContext,
	Structured,
} from "@sealcode/jdd";
import objectPath from "object-path";

export const actionName = "Components";

const rerender = "this.closest('form').requestSubmit()";

const actions = {
	add_array_item: (
		state: State,
		_: Record<string, string>,
		arg_path: string[],
		empty_value: unknown
	) => {
		const args = state.args;
		objectPath.insert(
			args,
			arg_path,
			empty_value,
			((objectPath.get(args, arg_path) as unknown[]) || []).length
		);
		return {
			...state,
			args,
		};
	},
	remove_array_item: (
		state: State,
		_: Record<string, string>,
		arg_path: string[],
		index_to_remove: number
	) => {
		const args = state.args;
		objectPath.del(args, [...arg_path, index_to_remove]);
		return {
			...state,
			args,
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
		return html(ctx, "Components", content, {
			morphing: true,
			preserveScroll: true,
			autoRefreshCSS: true,
			navbar: () => ``,
		});
	}

	renderListArgument<T>(
		state: State,
		arg_path: string[],
		arg: List<ComponentArgument<T>>,
		value: T[] = []
	): FlatTemplatable {
		return (
			<fieldset>
				<legend>{arg_path.at(-1)}</legend>
				{value.map((e, i) => (
					<div style="display: flex">
						{this.renderArgumentInput(
							state,
							[...arg_path, i.toString()],
							arg.item_type,
							e
						)}
						{this.makeActionButton(
							state,
							{ action: "remove_array_item", label: "❌" },
							arg_path,
							i
						)}
					</div>
				))}
				{this.makeActionButton(
					state,
					{
						action: "add_array_item",
						label: "➕",
					},
					arg_path,
					arg.item_type.getExampleValue()
				)}
			</fieldset>
		);
	}

	renderStructuredArgument<
		T extends Structured<Record<string, ComponentArgument<unknown>>>
	>(
		state: State,
		arg_path: string[],
		arg: T,
		value: Record<string, unknown>
	): FlatTemplatable {
		return (
			<fieldset>
				<legend>{arg_path.at(-1)}</legend>
				{Object.entries(arg.structure).map(([arg_name, arg]) => (
					<div>
						{this.renderArgumentInput(
							state,
							[...arg_path, arg_name],
							arg,
							(value as Record<string, unknown>)[arg_name]
						)}
					</div>
				))}
			</fieldset>
		);
	}

	printArgPath(path: string[]): string {
		return path.map((e) => `[${e}]`).join("");
	}

	renderEnumArgument<T extends Enum<any>>(
		state: State,
		arg_path: string[],
		arg: T,
		value: string
	): FlatTemplatable {
		return (
			<div>
				<label>
					{arg_path.at(-1)}
					<select
						name={`$.args${this.printArgPath(arg_path)}`}
						onchange={rerender}
					>
						{arg.values.map((v) => (
							<option value={v} selected={value == v}>
								{v}
							</option>
						))}
					</select>
				</label>
			</div>
		);
	}

	renderArgumentInput<T>(
		state: State,
		arg_path: string[],
		arg: ComponentArgument<T>,
		value: T
	): FlatTemplatable {
		if (value === undefined) {
			value = arg.getEmptyValue();
		}
		if (arg instanceof List) {
			return this.renderListArgument(state, arg_path, arg, value as T[]);
		}

		if (arg instanceof Structured) {
			return this.renderStructuredArgument(
				state,
				arg_path,
				arg,
				value as Record<string, unknown>
			);
		}

		if (arg instanceof Enum) {
			return this.renderEnumArgument(state, arg_path, arg, value as string);
		}
		return (
			<div>
				<label>
					{arg_path.at(-1)}
					{arg.getTypeName() == "markdown" ? (
						<textarea
							name={`$.args${this.printArgPath(arg_path)}`}
							onblur={rerender}
							cols="70"
						>
							{value as string}
						</textarea>
					) : (
						<input
							type="text"
							name={`$.args${this.printArgPath(arg_path)}`}
							value={value as string}
							size="70"
						/>
					)}
				</label>
			</div>
		);
	}

	render(ctx: BaseContext, state: State, inputs: Record<string, string>) {
		const all_components = registry.getAll();
		const component =
			registry.get(state.component) || Object.values(all_components)[0];
		return (
			<div class="two-column">
				<div class="resizable">
					{/*The below button has to be here in order for it to be the default behavior */}
					<input type="submit" value="Preview" />
					<select name="$.component" onchange={rerender}>
						{Object.entries(all_components).map(([name]) => (
							<option value={name} selected={name == state.component}>
								{name}
							</option>
						))}
					</select>

					<fieldset class="component-preview-parameters">
						<legend>Parameters</legend>
						{Object.entries(component.getArguments()).map(([arg_name, arg]) =>
							this.renderArgumentInput(
								state,
								[arg_name],
								arg,
								state.args[arg_name] === undefined
									? arg.getExampleValue()
									: state.args[arg_name]
							)
						)}
						<input type="submit" value="Preview" />
					</fieldset>
					<div>{JSON.stringify(state)}</div>
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
				<div>
					<fieldset>
						<legend>Preview</legend>
						{render(
							registry,
							[{ component_name: state.component, args: state.args }],
							simpleJDDContext
						)}
					</fieldset>
				</div>
			</div>
		);
	}

	// wrapInForm(state: State, content: Templatable): Templatable {
	// 	return tempstream/* HTML */ `<turbo-frame id="components">
	// 		${super.wrapInForm(state, content)}
	// 	</turbo-frame> `;
	// }
})();
