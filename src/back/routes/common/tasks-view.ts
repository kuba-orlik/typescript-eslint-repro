import { BaseContext } from "koa";
import { CollectionItem } from "sealious";
import frame from "../../frame.js";
import { Tasks } from "../../collections/collections.js";

export function Task(task: CollectionItem<typeof Tasks>) {
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
			${task.get("title") as string}
			<form method="POST" action="/todo/">
				<input class="delete-button" type="submit" value="Delete" />
				<input
					class="hidden-button"
					type="hidden"
					name="taskId"
					value="${task.id}"
				/>
				<input
					class="hidden-button"
					type="hidden"
					id="action"
					name="action"
					value="delete"
				/>
			</form>
		</li>`
	);
}

/* 
	<form method="DELETE" action="/todo/${task.id}">
				<input class="delete-button" type="submit" value="Delete" />
			</form>
*/

export async function TaskList(ctx: BaseContext) {
	const { items: tasks } = await ctx.$app.collections.tasks.list(ctx.$context).fetch();

	const tasksTemplate = tasks.map(Task).join("\n");
	return `
                <ul>
                    ${tasksTemplate}
                </ul>
            `;
}
