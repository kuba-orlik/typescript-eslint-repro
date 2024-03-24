import { FlatTemplatable, TempstreamJSX } from "tempstream";
import {
	Component,
	ComponentArguments,
	ExtractStructuredComponentArgumentsValues,
	isTableHeader,
	JDDContext,
} from "@sealcode/jdd";

const component_arguments = {
	table: new ComponentArguments.Table(
		new ComponentArguments.ShortText(),
		new ComponentArguments.Structured({
			color: new ComponentArguments.Enum(["red", "blue", "green", "aquamarine"]),
			word: new ComponentArguments.ShortText().setExampleValues([
				"apple",
				"banana",
				"pineapple",
				"carrot",
			]),
		})
	),
} as const;

export class Table extends Component<typeof component_arguments> {
	getArguments() {
		return component_arguments;
	}

	toHTML({
		table,
	}: ExtractStructuredComponentArgumentsValues<
		typeof component_arguments
	>): FlatTemplatable {
		return (
			<div class="table">
				<table>
					<tbody>
						{table.rows.map((row) =>
							isTableHeader(row) ? (
								<tr>
									<th
										colspan={this.getArguments()
											.table.getColumnsCount(table)
											.toString()}
									>
										{row.header_content}
									</th>
								</tr>
							) : (
								<tr>
									{row.cells.map(({ color, word }) => (
										<td style={`color: ${color}`}>{word}</td>
									))}
								</tr>
							)
						)}
					</tbody>
				</table>
			</div>
		);
	}
}
