import { Controller } from "stimulus";

export default class InputImagePreview extends Controller {
	id: string;

	handleChange(event) {
		const img = this.element.querySelector("img");
		console.log({ img });
		window.URL.revokeObjectURL(img.src);
		const new_url = window.URL.createObjectURL(
			this.element.querySelector("input").files[0]
		);
		console.log({ new_url });
		img.src = new_url;
		img.parentNode;
		img.parentElement
			.querySelectorAll("source")
			.forEach((e) => e.parentNode.removeChild(e));
		img.style.aspectRatio = "1";
	}
}
