import { FlatTemplatable, TempstreamJSX } from "tempstream";
import {
	Component,
	ComponentArguments,
	ExtractStructuredComponentArgumentsValues,
	JDDContext,
} from "@sealcode/jdd";

const component_arguments = {
	image_with_alt: new ComponentArguments.Structured({
		image: new ComponentArguments.Image(),
		alt: new ComponentArguments.ShortText(),
	}),
	multiple_images: new ComponentArguments.List(new ComponentArguments.Image()),
} as const;

export class ImageDemo extends Component<typeof component_arguments> {
	getArguments() {
		return component_arguments;
	}

	toHTML(
		{
			image_with_alt,
			multiple_images,
		}: ExtractStructuredComponentArgumentsValues<typeof component_arguments>,
		{ render_image }: JDDContext
	): FlatTemplatable {
		return (
			<div class="image-demo">
				<h2>Image with alt text</h2>
				{" " ||
					render_image(image_with_alt.image, {
						container: { width: 200, height: 200 },
						alt: image_with_alt.alt,
					})}

				<h2>Multiple images</h2>
				<div class="image-grid">
					{multiple_images.map((image) =>
						render_image(image, {
							container: { width: 200, height: 200, objectFit: "cover" },
						})
					)}
				</div>

				<h2>The same images but cropped with smartcrop</h2>
				<div class="image-grid">
					{multiple_images.map((image) =>
						render_image(image, {
							container: {
								width: 200,
								height: 200,
								objectFit: "cover",
							},
							crop: { width: 200, height: 200 },
						})
					)}
				</div>
			</div>
		);
	}
}
