import objectPath from "object-path";
import { registry } from "../../jdd-components/components.js";
import type { ComponentPreviewState } from "../components.sreact.js";
import { jdd_context } from "../jdd-context.js";

export const ComponentPreviewActions = <const>{
	add_array_item: (
		state: ComponentPreviewState,
		_: Record<string, string>,
		arg_path: string[],
		empty_value: unknown
	) => {
		const component_args = state.component_args;
		objectPath.insert(
			component_args,
			arg_path,
			empty_value,
			((objectPath.get(component_args, arg_path) as unknown[]) || []).length
		);
		return {
			...state,
			component_args,
		};
	},
	remove_array_item: (
		state: ComponentPreviewState,
		_: Record<string, string>,
		arg_path: string[],
		index_to_remove: number
	) => {
		const component_args = state.component_args;
		objectPath.del(component_args, [...arg_path, index_to_remove]);
		return {
			...state,
			component_args,
		};
	},
	change_component: async (
		state: ComponentPreviewState,
		inputs: Record<string, string>
	) => {
		const component_name = inputs.component;
		const component = registry.get(component_name);
		return {
			...state,
			component: component_name,
			component_args: (await component?.getExampleValues(jdd_context)) || {},
		};
	},
	randomize_args: async (
		state: ComponentPreviewState,
		inputs: Record<string, string>
	) => {
		const component_name = inputs.component;
		const component = registry.get(component_name);
		return {
			...state,
			component_args: (await component?.getExampleValues(jdd_context)) || {},
		};
	},
};
