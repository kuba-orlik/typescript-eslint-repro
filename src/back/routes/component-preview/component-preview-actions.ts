import { isTableData, isTableRegularRow, TableData } from "@sealcode/jdd";
import { is, predicates } from "@sealcode/ts-predicates";
import objectPath from "object-path";
import { registry } from "../../jdd-components/components.js";
import type { ComponentPreviewState } from "../components.sreact.js";
import { jdd_context } from "../jdd-context.js";

function moveElement<T>(array: Array<T>, fromIndex: number, toIndex: number): Array<T> {
	const element = array.splice(fromIndex, 1)[0];
	array.splice(toIndex, 0, element);
	return array;
}

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
	add_table_row: (
		state: ComponentPreviewState,
		_: Record<string, string>,
		arg_path: string[],
		empty_value: unknown,
		columns: number,
		type: "header" | "row" = "row"
	) => {
		const component_args = state.component_args;
		let row;
		if (type == "header") {
			row = { type: "header", header_content: empty_value };
		} else {
			const cells = [];
			for (let i = 0; i < columns; i++) {
				cells.push(empty_value);
			}
			row = { type: "row", cells };
		}
		objectPath.insert(
			component_args,
			[...arg_path, "rows"],
			row,
			((objectPath.get(component_args, [...arg_path, "rows"]) as unknown[]) || [])
				.length
		);
		const result = {
			...state,
			component_args,
		};
		return result;
	},
	add_table_column: (
		state: ComponentPreviewState,
		_: Record<string, string>,
		arg_path: string[],
		empty_value: unknown
	) => {
		const component_args = state.component_args;
		const tableData = objectPath.get(component_args, arg_path);
		if (!isTableData(tableData)) {
			throw new Error("wrong table data");
		}
		for (const i in tableData.rows) {
			const row = tableData.rows[i];
			if (isTableRegularRow(row)) {
				row.cells.push(empty_value);
			}
		}
		objectPath.set(component_args, arg_path, tableData);
		return {
			...state,
			component_args,
		};
	},

	remove_table_column: (
		state: ComponentPreviewState,
		_: Record<string, string>,
		arg_path: string[],
		column_index_to_remove: number
	) => {
		const component_args = state.component_args;
		const tableData = objectPath.get(component_args, arg_path);
		if (!isTableData(tableData)) {
			throw new Error("wrong table data");
		}
		for (const i in tableData.rows) {
			const row = tableData.rows[i];
			if (isTableRegularRow(row)) {
				row.cells = row.cells.filter((_, i) => i != column_index_to_remove);
			}
		}
		objectPath.set(component_args, arg_path, tableData);
		return {
			...state,
			component_args,
		};
	},
	remove_table_row: (
		state: ComponentPreviewState,
		_: Record<string, string>,
		arg_path: string[],
		row_index: number
	) => {
		const component_args = state.component_args;
		objectPath.del(component_args, [...arg_path, "rows", row_index]);
		const result = {
			...state,
			component_args,
		};
		return result;
	},
	move_table_column_right: (
		state: ComponentPreviewState,
		_: Record<string, string>,
		arg_path: string[],
		column_index: number
	) => {
		const component_args = state.component_args;
		const data = objectPath.get(component_args, arg_path) as TableData<
			unknown,
			unknown
		>;
		for (const row of data.rows) {
			if (row.type == "row") {
				moveElement(row.cells, column_index, column_index + 1);
			}
		}
		objectPath.set(component_args, [...arg_path, "rows"], data.rows);
		const result = {
			...state,
			component_args,
		};
		return result;
	},

	move_table_row_down: (
		state: ComponentPreviewState,
		_: Record<string, string>,
		arg_path: string[],
		row_index: number
	) => {
		const component_args = state.component_args;
		const data = objectPath.get(component_args, arg_path) as TableData<
			unknown,
			unknown
		>;
		moveElement(data.rows, row_index, row_index + 1);
		objectPath.set(component_args, [...arg_path, "rows"], data.rows);
		const result = {
			...state,
			component_args,
		};
		return result;
	},
};
