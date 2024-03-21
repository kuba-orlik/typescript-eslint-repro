import { TempstreamJSX } from "tempstream";
import {
	Component,
	ComponentArguments,
	ExtractStructuredComponentArgumentsValues,
	JDDContext,
} from "@sealcode/jdd";
import { Readable } from "stream";

const component_arguments = {
	title: new ComponentArguments.ShortText(),
	content: new ComponentArguments.Markdown(),
	images: new ComponentArguments.List(
		new ComponentArguments.Structured({
			image: new ComponentArguments.Image(),
			alt: new ComponentArguments.ShortText(),
		})
	),
} as const;

export class NiceBox extends Component<typeof component_arguments> {
	getArguments() {
		return component_arguments;
	}

	async toHTML(
		{
			title,
			content,
			images,
		}: ExtractStructuredComponentArgumentsValues<typeof component_arguments>,
		{ render_markdown, render_image }: JDDContext
	): Promise<Readable> {
		return (
			<div class="nice-box">
				<h2>{title}</h2>
				<div>{render_markdown(content)}</div>
				{images.map((image) =>
					render_image(image.image, {
						container: {
							width: 200,
							height: 200,
							objectFit: "contain",
						},
						alt: image?.alt || "",
					})
				)}
			</div>
		);
	}
}
