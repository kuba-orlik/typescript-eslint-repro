import { ComponentArgument, isTableHeader, List, Table, TableData } from "@sealcode/jdd";
import { StatefulPage } from "@sealcode/sealgen";
import { TempstreamJSX } from "tempstream";
import { ComponentPreviewState } from "../components.sreact.js";
import { jdd_context } from "../jdd-context.js";
import { ComponentInput } from "./component-input.js";
import type { ComponentPreviewActions } from "./component-preview-actions.js";

import delete_column_icon from "./table-delete-column.svg";
import add_row_below_icon from "./table-add-row-below.svg";
import add_column_right_icon from "./table-add-column-right.svg";
import delete_row_icon from "./table-delete-row.svg";
import add_column_header_icon from "./table-add-row-header-below.svg";
import move_column_right_icon from "./table-move-column-right.svg";
import move_row_down_icon from "./table-move-row-down.svg";

export async function ComponentInputTable<
	State extends ComponentPreviewState,
	CellType,
	HeaderType
>({
	state,
	arg_path,
	arg,
	value,
	page,
}: {
	state: State;
	arg_path: string[];
	arg: Table<CellType, HeaderType>;
	value: TableData<CellType, HeaderType>;
	page: StatefulPage<ComponentPreviewState, typeof ComponentPreviewActions>;
}) {
	if (!value) {
		value = arg.getEmptyValue();
	}
	const empty_cell_value = arg.cell_type.getExampleValue(jdd_context);
	const empty_header_value = arg.header_type.getExampleValue(jdd_context);

	return (
		<fieldset>
			<legend>{arg_path.at(-1)}</legend>
			<div>
				<table style="position: relative; /* necessary for sticky th*/">
					<tbody>
						<tr>
							<td></td>
							{[...Array(arg.getColumnsCount(value)).keys()].map(
								(column_index) => (
									<th class="sticky sticky--top subdued">
										{page.makeActionButton(
											state,
											{
												action: "remove_table_column",
												label: "Remove column",
												content: /* HTML */ `<img
													width="20"
													height="20"
													src="${delete_column_icon.url}"
												/>`,
											},
											arg_path,
											column_index
										)}
										{column_index >= arg.getColumnsCount(value) - 1
											? ""
											: page.makeActionButton(
													state,
													{
														action: "move_table_column_right",
														label: "Move column to the right",
														content: /* HTML */ `<img
															width="20"
															height="20"
															src="${move_column_right_icon.url}"
														/>`,
													},
													arg_path,
													column_index
											  )}
									</th>
								)
							)}
						</tr>
						{value.rows.map((row, row_index) => (
							<tr>
								<td class="sticky sticky--left subdued">
									<div style="display: flex; flex-flow: column; row-gap: 5px;">
										{page.makeActionButton(
											state,
											{
												action: "remove_table_row",
												label: "Remove row",
												content: /* HTML */ `<img
													width="20"
													height="20"
													src="${delete_row_icon.url}"
												/>`,
											},
											arg_path,
											row_index
										)}
										{page.makeActionButton(
											state,
											{
												action: "move_table_row_down",
												label: "Move this row down",
												content: /* HTML */ `<img
													width="20"
													height="20"
													src="${move_row_down_icon.url}"
												/>`,
											},
											arg_path,
											row_index
										)}
									</div>
								</td>
								{isTableHeader(row) ? (
									<th colspan={arg.getColumnsCount(value).toString()}>
										<ComponentInput
											{...{
												state,
												arg_path: [
													...arg_path,
													"rows",
													row_index.toString(),
													"header_content",
												],
												arg: arg.header_type,
												value: row.header_content,
												page,
											}}
										/>
									</th>
								) : (
									row.cells.map((cell, cell_index) => (
										<td>
											<ComponentInput
												{...{
													state,
													arg_path: [
														...arg_path,
														"rows",
														row_index.toString(),
														"cells",
														cell_index.toString(),
													],
													arg: arg.cell_type,
													value: cell,
													page,
												}}
											/>
										</td>
									))
								)}
								{row_index == 0 ? (
									<td
										class="subdued"
										rowspan={value.rows.length.toString()}
									>
										{page.makeActionButton(
											state,
											{
												action: "add_table_column",
												label: "Add column",
												content: /* HTML */ `<img
													width="20"
													height="20"
													src="${add_column_right_icon.url}"
												/>`,
											},
											arg_path,
											empty_cell_value
										)}
									</td>
								) : (
									""
								)}
							</tr>
						))}
						<tr>
							<td
								class="subdued"
								colspan={(arg.getColumnsCount(value) + 1).toString()}
							>
								{page.makeActionButton(
									state,
									{
										action: "add_table_row",
										label: "Add table row",
										content: /* HTML */ `<img
											width="20"
											height="20"
											src="${add_row_below_icon.url}"
										/>`,
									},
									arg_path,
									empty_cell_value,
									arg.getColumnsCount(value)
								)}
								{page.makeActionButton(
									state,
									{
										action: "add_table_row",
										label: "Add table header",
										content: /* HTML */ `<img
											width="20"
											height="20"
											src="${add_column_header_icon.url}"
										/>`,
									},
									arg_path,
									empty_header_value,
									arg.getColumnsCount(value),
									"header"
								)}
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</fieldset>
	);
}
