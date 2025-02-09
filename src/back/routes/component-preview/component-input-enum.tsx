import { Enum } from "@sealcode/jdd";
import { TempstreamJSX } from "tempstream";
import { printArgPath } from "./print-arg-path.js";

export function ComponentInputEnum<State, S extends string, T extends Enum<S>>({
	arg_path,
	arg,
	value,
	onchange,
}: {
	state: State;
	arg_path: string[];
	arg: T;
	value: string;
	onchange?: string;
}) {
	return (
		<div>
			<label>
				{arg_path.at(-1) || ""}
				<select
					name={`$.component_args${printArgPath(arg_path)}`}
					onchange={onchange}
				>
					{arg.values.map((v: S) => (
						<option value={v} selected={value == v}>
							{v}
						</option>
					))}
				</select>
			</label>
		</div>
	);
}
