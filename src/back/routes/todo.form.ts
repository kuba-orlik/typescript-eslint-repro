import { tempstream } from "tempstream";
import { Context } from "koa";
import { Form, FormData, FormDataValue, Fields, Controls } from "@sealcode/sealgen";
import { Tasks } from "../collections/collections.js";
import html from "../html.js";
import { TaskList } from "./common/tasks-view.js";

export const actionName = "Todo";

const fields = {
	name: new Fields.CollectionField(true, Tasks.fields.title),
};

export const TodoShape = Fields.fieldsToShape(fields);

export default new (class TodoForm extends Form<typeof fields, void> {
	defaultSuccessMessage = "Task has been successfully created";
	fields = fields;

	controls = [
		new Controls.SimpleInput(fields.name, {
			label: "Task name:",
			type: "text",
			placeholder: "Write an Matrix bot",
		}),
		new Controls.HTML("decoration", (fctx) => {
			return `<input class="hidden-button" type="hidden" id="action" name="action" value="create" form="${fctx.form_id}" />`;
		}),
	];

	async validateValues(
		ctx: Context,
		data: Record<string, FormDataValue>
	): Promise<{ valid: boolean; error: string }> {
		const { parsed: name } = await this.fields.name.getValue(ctx, data);

		if ((name || "").length < 3) {
			return {
				valid: true,
				error: "The name of the task must have at least 3 characters",
			};
		} else {
			const filter: object = name ? { title: name } : {};

			const tasks = await ctx.$app.collections.tasks
				.list(ctx.$context)
				.filter(filter)
				.fetch();
			if (tasks.empty) {
				return { valid: true, error: "" };
			}
			return { valid: false, error: "Task with the same name already exists" };
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async canAccess(ctx: Context) {
		if (ctx.$context.session_id) {
			return { canAccess: true, message: "" };
		}
		return { canAccess: false, message: "" };
	}

	async onSubmit(ctx: Context, data: FormData) {
		const action: FormDataValue = data.raw_values.action;

		switch (action) {
			case "create": {
				try {
					await ctx.$app.collections.tasks.create(ctx.$context, {
						title: String(data.raw_values.name),
						done: false,
					});
				} catch (error) {
					throw new Error();
				}
				console.debug(`task has been successfully created`);
				break;
			}
			case "delete": {
				const task = await ctx.$app.collections.tasks.getByID(
					ctx.$context,
					data.raw_values.taskId as string
				);
				await task.remove(ctx.$context);
				console.debug(`task has been successfully removed`);
				break;
			}
			default: {
				console.debug("Wrong action");
				break;
			}
		}

		return;
	}

	async render(ctx: Context, data: FormData, show_field_errors: boolean) {
		return html(
			ctx,
			"Todo",
			tempstream`${await super.render(ctx, data, show_field_errors)}
					${TaskList(ctx)}
					`
		);
	}
})();
