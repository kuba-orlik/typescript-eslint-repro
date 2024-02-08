import { FlatTemplatable, TempstreamJSX } from "tempstream";
import {
	Component,
	ComponentArguments,
	ExtractStructuredComponentArgumentsValues,
	JDDContext,
} from "@sealcode/jdd";

const component_arguments = {
	title: new ComponentArguments.ShortText(),
	content: new ComponentArguments.Markdown(),
} as const;

export class NiceBox extends Component<typeof component_arguments> {
	getArguments() {
		return component_arguments;
	}

	toHTML(
		{
			title,
			content,
		}: ExtractStructuredComponentArgumentsValues<typeof component_arguments>,
		{ render_markdown }: JDDContext
	): FlatTemplatable {
		return (
			<div class="nice-box">
				<h2>{title}</h2>
				<div>{render_markdown(content)}</div>
			</div>
		);
	}
}
