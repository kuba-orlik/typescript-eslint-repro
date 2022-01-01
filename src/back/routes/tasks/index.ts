import { Middlewares } from "sealious";
import { MainView } from "..";
import { router } from "../..";

router.post(
	"/tasks",
	Middlewares.extractContext(),
	Middlewares.parseBody(),
	async (ctx) => {
		await ctx.$app.collections.tasks
			.make({
				title: ctx.$body.title as string,
				done: false,
			})
			.save(ctx.$context);
		ctx.body = MainView(ctx);
	}
);

router.delete("/tasks/:task_id", Middlewares.extractContext(), async (ctx) => {
	const task = await ctx.$app.collections.tasks.getByID(
		ctx.$context,
		ctx.params.task_id
	);
	await task.remove(ctx.$context);
	ctx.body = MainView(ctx);
});
