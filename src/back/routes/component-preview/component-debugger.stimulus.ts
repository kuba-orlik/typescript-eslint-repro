import { Controller } from "stimulus";

export default class ComponentDebugger extends Controller {
	id: string;
	main_form: HTMLFormElement;
	is_resizing: boolean = false;
	origin_x: number;
	origin_width: number;

	connect() {
		this.main_form = document.querySelector("#component-debugger").closest("form");
		document.documentElement.addEventListener("ts-rebuilt", () => {
			this.main_form.requestSubmit();
		});
		this.main_form.addEventListener("turbo:submit-end", () => {
			// this clears the values of file inputs, so they don't get unecessarily
			// re-uploaded on future submissions - the file is alreade there on the server
			this.main_form
				.querySelectorAll("input[type=file]")
				.forEach((input: HTMLInputElement) => (input.value = ""));
		});

		window.addEventListener("load", () => {
			this.update_width_display();
		});
		document.addEventListener("turbo:render", () => this.update_width_display());

		const gutter = this.targets.find("gutter") as HTMLDivElement;
		gutter.addEventListener("mousedown", (e) => {
			this.is_resizing = true;
			this.origin_x = e.clientX;
			const resizable = this.targets.find("preview") as HTMLSpanElement;
			this.origin_width = resizable.getBoundingClientRect().width;
			const handler = this.resizeHandler.bind(this);
			document.addEventListener("mousemove", handler);
			document.addEventListener("mouseup", () => {
				document.removeEventListener("mousemove", handler);
			});
			e.preventDefault();
		});
	}

	update_width_display() {
		const component_width = (this.targets.find("preview") as HTMLSpanElement)
			.offsetWidth;
		(
			this.targets.find("component-width") as HTMLSpanElement
		).innerHTML = `(width: ${component_width}px)`;
	}

	resizeHandler(e: MouseEvent) {
		const width_offset = this.origin_x - e.clientX;

		const new_width = Math.max(this.origin_width + width_offset, 1);
		document
			.getElementById("component-debugger")
			.style.setProperty("--resizable-column-width", new_width + "px");
		this.update_width_display();
	}
}
