import { Image } from "@sealcode/jdd";
import { StatefulPage } from "@sealcode/sealgen";
import { TempstreamJSX } from "tempstream";
import { ComponentPreviewState } from "../components.sreact.js";
import { jdd_context } from "../jdd-context.js";
import { ComponentPreviewActions } from "./component-preview-actions.js";
import { printArgPath } from "./print-arg-path.js";

export function ComponentInputImage<State extends ComponentPreviewState>({
	arg_path,
	arg,
	value,
}: {
	state: State;
	arg_path: string[];
	arg: Image;
	value: string;
	page: StatefulPage<ComponentPreviewState, typeof ComponentPreviewActions>;
}) {
	return (
		<div style="margin-bottom: 10px">
			<label
				style="display: flex; align-items: center; column-gap: 10px;"
				data-controller="input-image-preview"
			>
				{arg_path.at(-1) || ""}
				{value &&
					jdd_context.render_image(value, {
						container: { width: 40, height: 40, objectFit: "cover" },
						crop: { width: 40, height: 40 },
						style: "height: 40px; width: 40px;",
					})}
				<input
					type="file"
					name={`$.component_args${printArgPath(arg_path)}.new`}
					value=""
					autocomplete="off"
					data-action="change->input-image-preview#handleChange"
					multiple={arg.hasParent("list")}
				/>
			</label>
			<div>
				<input
					type="hidden"
					name={`$.component_args${printArgPath(arg_path)}.old`}
					value={(value || "")
						.replaceAll('"', "&quot;")
						.replaceAll("\n", "\\n")}
					autocomplete="off"
				/>
			</div>
		</div>
	);
}
