import { Controller } from "stimulus";

export default class TaskController extends Controller {
	id: string;

	connect() {
		const dataIdAttr = this.element.getAttribute("data-id");
		if (dataIdAttr) {
			this.id = dataIdAttr;
		}
	}

	async toggle(event: Event) {
		const inputElement: HTMLInputElement = event.target as HTMLInputElement;

		if (inputElement instanceof HTMLInputElement) {
			const isChecked: boolean = inputElement.checked;

			await fetch(`/api/v1/collections/tasks/${this.id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					done: isChecked,
				}),
			});
		}
	}
}
