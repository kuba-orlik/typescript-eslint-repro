import { Controller } from "stimulus";

export default class InputImagePreview extends Controller {
	id: string;

	handleChange() {
		const img = this.element.querySelector("img");
		window.URL.revokeObjectURL(img.src);
		const new_url = window.URL.createObjectURL(
			this.element.querySelector("input").files[0]
		);
		img.src = new_url;
		img.parentNode;
		img.parentElement
			.querySelectorAll("source")
			.forEach((e) => e.parentNode.removeChild(e));
		img.style.aspectRatio = "1";
	}
}
