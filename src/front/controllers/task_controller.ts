/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller } from "stimulus";

export default class TaskController extends Controller {
	id: string;

	connect(): void {
		this.id = this.element.attributes["data-id"].value;
	}

	async toggle(event: Event): Promise<void> {
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
