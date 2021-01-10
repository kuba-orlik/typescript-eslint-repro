import { Controller } from "stimulus";

window;

export default class extends Controller {
	id: string;

	connect() {
		this.id = this.element.attributes["data-id"].value;
	}

	async toggle(event: Event) {
		await fetch(`/api/v1/collections/tasks/${this.id}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				done: (event.target as HTMLInputElement).checked,
			}),
		});
	}
}
