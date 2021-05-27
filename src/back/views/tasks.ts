import { CollectionItem, Context } from "sealious";
import frame from "../frame";

export function Task(task: CollectionItem<any>) {
	return frame(
		`task-${task.id}`,
		/* HTML */ `<li class="task">
			<input
				type="checkbox"
				data-controller="task"
				data-action="task#toggle"
				data-id="${task.id}"
				${task.get("done") ? "checked" : ""}
			/>
			${task.get("title")}

			<form
				method="DELETE"
				action="/tasks/${task.id}"
				data-turbo-frame="task-list"
			>
				<input class="delete-button" type="submit" value="🗑" />
			</form>
		</li>`
	);
}

export async function TaskList(context: Context) {
	const { items: tasks } = await context.app.collections.tasks
		.list(context)
		.fetch();
	return frame(
		"task-list",
		/* HTML */ `
			<ul>
				${tasks.map(Task).join("\n")}
			</ul>
		`
	);
}

export function NewTask() {
	return frame(
		"new-task",
		/* HTML */ `<form
			method="POST"
			action="/tasks"
			data-turbo-frame="task-list"
		>
			<input
				id="new-task-title"
				type="text"
				placeholder="write an app"
				name="title"
			/>
			<input type="submit" value="Add" />
		</form>`
	);
}
